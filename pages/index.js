import { useState, useMemo } from "react";

const STATES = ["TX","FL","GA","TN","NC","SC","AL","VA","KY","OK","MO"];

export default function Home(){
  const [loads,setLoads]=useState([]);
  const [history,setHistory]=useState([]);
  const [raw,setRaw]=useState("");
  const [diesel,setDiesel]=useState(4.0);
  const [mpg,setMpg]=useState(10);
  const [suggestion,setSuggestion]=useState("");

  const [fuelExp,setFuelExp]=useState([]);
  const [maintExp,setMaintExp]=useState([]);
  const [fixedExp]=useState([500,1415]);

  const COST = (diesel/mpg) + 0.15 + 0.22;

  const parseLoad=(text)=>{
    const nums = text.match(/\d+/g)||[];
    return {
      rate: nums[0]||"",
      miles: nums[1]||"",
      deadhead:"50",
      state: STATES.find(s=>text.toUpperCase().includes(s))||"TX"
    };
  };

  const addLoad=()=>{
    const l=parseLoad(raw);
    setLoads([...loads,l]);
    setRaw("");
  };

  const analyzed = useMemo(()=>{
    return loads.map(l=>{
      const total=Number(l.miles)+Number(l.deadhead);
      if(!l.rate||!total) return null;

      const rpm=l.rate/total;
      const profit=(rpm-COST)*total;

      return {...l,total,rpm,profit};
    }).filter(Boolean).sort((a,b)=>b.profit-a.profit);
  },[loads,COST]);

  const run=()=>{
    setHistory([...history,...analyzed]);

    if(analyzed.length>0){
      const best=analyzed[0];
      setSuggestion(`BOOK THIS → $${best.rate} | ${best.miles}mi | ${best.state}`);
    }
  };

  const metrics = useMemo(()=>{
    const revenue = history.reduce((s,l)=>s+Number(l.rate||0),0);
    const miles = history.reduce((s,l)=>s+l.total,0);

    const fuelTotal = fuelExp.reduce((s,e)=>s+Number(e||0),0);
    const maintTotal = maintExp.reduce((s,e)=>s+Number(e||0),0);
    const fixedTotal = fixedExp.reduce((s,e)=>s+Number(e||0),0);

    const expenses = fuelTotal + maintTotal + fixedTotal;
    const profit = revenue - (miles*COST) - expenses;

    const avgRPM = miles ? revenue/miles : 0;

    const lanes={};
    history.forEach(l=>{
      lanes[l.state]=(lanes[l.state]||0)+l.profit;
    });

    const sorted = Object.entries(lanes).sort((a,b)=>b[1]-a[1]);

    return {
      revenue,
      miles,
      profit,
      avgRPM,
      expenses,
      topLane: sorted[0]?.[0] || "-",
      worstLane: sorted[sorted.length-1]?.[0] || "-"
    };
  },[history,fuelExp,maintExp,fixedExp,COST]);

  return(
    <div style={{padding:20,background:"#020617",color:"white",minHeight:"100vh"}}>
      <h1>🚛 3HC Company AI</h1>

      <div style={card}>
        <textarea style={input} value={raw} onChange={e=>setRaw(e.target.value)} placeholder="Paste loads" />
        <button style={btn} onClick={addLoad}>Add Load</button>
      </div>

      <div style={card}>
        <input style={input} value={diesel} onChange={e=>setDiesel(e.target.value)} />
        <input style={input} value={mpg} onChange={e=>setMpg(e.target.value)} />
        <div>Cost/Mile: ${COST.toFixed(2)}</div>
      </div>

      <button style={btn} onClick={run}>Run AI</button>

      {suggestion && (
        <div style={{...card,border:"2px solid #22c55e"}}>
          <h2>🤖 AI Decision</h2>
          <div>{suggestion}</div>
        </div>
      )}

      {analyzed.map((l,i)=>(
        <div key={i} style={card}>
          <div>Profit: ${l.profit.toFixed(0)}</div>
          <div>RPM: ${l.rpm.toFixed(2)}</div>
          <div>{l.state}</div>
        </div>
      ))}

      <div style={card}>
        <input style={input} placeholder="Fuel" onKeyDown={e=>{
          if(e.key==="Enter"){setFuelExp([...fuelExp,e.target.value]);e.target.value="";}
        }}/>
        <input style={input} placeholder="Maintenance" onKeyDown={e=>{
          if(e.key==="Enter"){setMaintExp([...maintExp,e.target.value]);e.target.value="";}
        }}/>
      </div>

      <div style={card}>
        <h3>📊 Dashboard</h3>
        <div>Revenue: ${metrics.revenue.toFixed(0)}</div>
        <div>Expenses: ${metrics.expenses.toFixed(0)}</div>
        <div>Profit: ${metrics.profit.toFixed(0)}</div>
        <div>Avg RPM: ${metrics.avgRPM.toFixed(2)}</div>
        <div>Top Lane: {metrics.topLane}</div>
        <div>Worst Lane: {metrics.worstLane}</div>
      </div>
    </div>
  );
}

const card={padding:15,marginBottom:12,background:"#1e293b",borderRadius:12};
const input={display:"block",width:"100%",padding:"10px",marginBottom:"8px",borderRadius:"8px"};
const btn={width:"100%",padding:"12px",marginTop:"8px",borderRadius:"10px",background:"#3b82f6",color:"white"};
