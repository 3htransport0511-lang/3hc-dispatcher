import { useState, useMemo } from "react";

const STATES = ["TX","FL","GA","TN","NC","SC","AL","VA","KY","OK","MO"];

export default function Home(){
  const [loads,setLoads]=useState([]);
  const [history,setHistory]=useState([]);
  const [expenses,setExpenses]=useState([]);
  const [raw,setRaw]=useState("");
  const [diesel,setDiesel]=useState(4.0);
  const [mpg,setMpg]=useState(10);

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

  const analyze=()=>{
    const res=loads.map(l=>{
      const total=Number(l.miles)+Number(l.deadhead);
      const rpm=l.rate/total;
      const profit=(rpm-COST)*total;
      return {...l,total,rpm,profit};
    }).sort((a,b)=>b.rpm-a.rpm);

    setHistory([...history,...res]);
  };

  const metrics = useMemo(()=>{
    const revenue = history.reduce((s,l)=>s+Number(l.rate||0),0);
    const miles = history.reduce((s,l)=>s+l.total,0);
    const expensesTotal = expenses.reduce((s,e)=>s+Number(e||0),0);
    const profit = revenue - (miles*COST) - expensesTotal;

    const avgRPM = miles? revenue/miles:0;

    const bestLane = history.reduce((acc,l)=>{
      acc[l.state]=(acc[l.state]||0)+l.profit;
      return acc;
    },{});

    const best = Object.entries(bestLane).sort((a,b)=>b[1]-a[1])[0];

    return {
      revenue,miles,profit,avgRPM,
      bestLane: best? best[0]:"-"
    };
  },[history,expenses,COST]);

  return(
    <div style={{padding:20,background:"#020617",color:"white",minHeight:"100vh"}}>
      <h1>🚛 3HC Business AI</h1>

      <div style={card}>
        <h3>📋 Add Load</h3>
        <textarea style={input} value={raw} onChange={e=>setRaw(e.target.value)} />
        <button style={btn} onClick={addLoad}>Add</button>
      </div>

      <div style={card}>
        <h3>⛽ Costs</h3>
        <input style={input} value={diesel} onChange={e=>setDiesel(e.target.value)} />
        <input style={input} value={mpg} onChange={e=>setMpg(e.target.value)} />
        <div>Cost/Mile: ${COST.toFixed(2)}</div>
      </div>

      <button style={btn} onClick={analyze}>Run AI</button>

      <div style={card}>
        <h3>💸 Add Expense</h3>
        <input style={input} placeholder="Expense" onKeyDown={e=>{
          if(e.key==="Enter"){
            setExpenses([...expenses,e.target.value]);
            e.target.value="";
          }
        }}/>
      </div>

      <div style={card}>
        <h3>📊 Business Dashboard</h3>
        <div>Revenue: ${metrics.revenue.toFixed(0)}</div>
        <div>Miles: {metrics.miles}</div>
        <div>Profit: ${metrics.profit.toFixed(0)}</div>
        <div>Avg RPM: ${metrics.avgRPM.toFixed(2)}</div>
        <div>Best Lane: {metrics.bestLane}</div>
      </div>
    </div>
  );
}

const card={padding:15,marginBottom:12,background:"#1e293b",borderRadius:12};
const input={display:"block",width:"100%",padding:"10px",marginBottom:"8px",borderRadius:"8px"};
const btn={width:"100%",padding:"12px",marginTop:"8px",borderRadius:"10px",background:"#3b82f6",color:"white"}
