import { useState, useMemo } from "react";

const STATES = ["TX","FL","GA","TN","NC","SC","AL","VA","KY","OK","MO"];

export default function Home(){
  const [loads,setLoads]=useState([]);
  const [history,setHistory]=useState([]);
  const [raw,setRaw]=useState("");
  const [diesel,setDiesel]=useState(4.0);
  const [mpg,setMpg]=useState(10);
  const [suggestion,setSuggestion]=useState("");

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

    if(analyzed.length > 0){
      const best = analyzed[0];
      setSuggestion(`BOOK THIS → $${best.rate} | ${best.miles}mi | ${best.state}`);
    }
  };

  const metrics = useMemo(()=>{
    const revenue = history.reduce((s,l)=>s+Number(l.rate||0),0);
    const miles = history.reduce((s,l)=>s+l.total,0);
    const profit = revenue - (miles*COST);

    return { revenue, miles, profit };
  },[history,COST]);

  return(
    <div style={{padding:20,background:"#020617",color:"white",minHeight:"100vh"}}>
      <h1>🚛 3HC Auto Dispatcher AI</h1>

      <div style={card}>
        <h3>⚡ Paste Loads</h3>
        <textarea style={input} value={raw} onChange={e=>setRaw(e.target.value)} />
        <button style={btn} onClick={addLoad}>Add Load</button>
      </div>

      <div style={card}>
        <h3>⛽ Cost</h3>
        <input style={input} value={diesel} onChange={e=>setDiesel(e.target.value)} />
        <input style={input} value={mpg} onChange={e=>setMpg(e.target.value)} />
        <div>Cost/Mile: ${COST.toFixed(2)}</div>
      </div>

      <button style={btn} onClick={run}>Run Auto AI</button>

      {suggestion && (
        <div style={{...card, border:"2px solid #22c55e"}}>
          <h2>🤖 AI Recommendation</h2>
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
        <h3>📊 Business</h3>
        <div>Revenue: ${metrics.revenue.toFixed(0)}</div>
        <div>Profit: ${metrics.profit.toFixed(0)}</div>
      </div>
    </div>
  );
}

const card={padding:15,marginBottom:12,background:"#1e293b",borderRadius:12};
const input={display:"block",width:"100%",padding:"10px",marginBottom:"8px",borderRadius:"8px"};
const btn={width:"100%",padding:"12px",marginTop:"8px",borderRadius:"10px",background:"#3b82f6",color:"white"}
