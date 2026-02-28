import { useState } from "react";

const STATES = ["FL","GA","TN","NC","TX","SC","AL","VA","KY","OK","MO","KS","AR"];
const STRONG = ["FL","GA","TN","NC","TX"];
const MEDIUM = ["SC","AL","VA","KY","OK","MO"];

function strength(s){
  if(STRONG.includes(s)) return "Strong";
  if(MEDIUM.includes(s)) return "Medium";
  return "Weak";
}

function bonus(level){
  if(level==="Strong") return 0.15;
  if(level==="Medium") return 0.05;
  return -0.1;
}

function nextMove(s){
  const map={
    FL:"Stay FL → GA → TX",
    GA:"GA → TX or NC",
    TN:"TN → TX or GA",
    NC:"NC → TX or GA",
    TX:"TX → Southeast"
  };
  return map[s]||"Move toward TX";
}

export default function Home(){
  const [loads,setLoads]=useState([{rate:"",miles:"",deadhead:"",state:"FL"}]);
  const [results,setResults]=useState([]);
  const [diesel,setDiesel]=useState(4.0);
  const [mpg,setMpg]=useState(10);
  const [weekly,setWeekly]=useState({revenue:0,miles:0});

  const fuelCost = diesel/mpg;
  const maintenance = 0.15;
  const fixed = 0.22; // from your setup
  const COST = fuelCost + maintenance + fixed;

  const update=(i,k,v)=>{
    const l=[...loads];
    l[i][k]=v;
    setLoads(l);
  };

  const add=()=>setLoads([...loads,{rate:"",miles:"",deadhead:"",state:"FL"}]);

  const run=()=>{
    const res=loads.map(l=>{
      const total=Number(l.miles)+Number(l.deadhead);
      if(!l.rate||!total) return null;

      const rpm=l.rate/total;
      const prof=(rpm-COST)*total;
      const s=strength(l.state);
      const adj=rpm+bonus(s);

      return{
        ...l,
        total,
        rpm,
        adj,
        prof,
        decision: adj>=1.5?"BOOK IT":adj>=1.2?"CONSIDER":"REJECT",
        next:nextMove(l.state)
      };
    }).filter(Boolean).sort((a,b)=>b.adj-a.adj);

    setResults(res);

    // weekly projection
    const rev = res.reduce((sum,r)=>sum+Number(r.rate||0),0);
    const miles = res.reduce((sum,r)=>sum+r.total,0);
    setWeekly({revenue:rev,miles});
  };

  return(
    <div style={{padding:20,fontFamily:"Arial",background:"#020617",minHeight:"100vh",color:"white"}}>
      <h1 style={{fontSize:28,fontWeight:"bold",marginBottom:10}}>🚛 3HC Dispatcher Elite</h1>

      {/* COST CONTROLS */}
      <div style={card}>
        <h3>⛽ Cost Settings</h3>
        <input style={input} value={diesel} onChange={e=>setDiesel(e.target.value)} placeholder="Diesel Price" />
        <input style={input} value={mpg} onChange={e=>setMpg(e.target.value)} placeholder="MPG" />
        <div style={{fontSize:14,opacity:0.8}}>Cost/Mile: ${COST.toFixed(2)}</div>
      </div>

      {/* LOAD INPUT */}
      {loads.map((l,i)=>(
        <div key={i} style={card}>
          <input style={input} placeholder="Rate ($)" onChange={e=>update(i,"rate",e.target.value)} />
          <input style={input} placeholder="Loaded Miles" onChange={e=>update(i,"miles",e.target.value)} />
          <input style={input} placeholder="Deadhead Miles" onChange={e=>update(i,"deadhead",e.target.value)} />
          <select style={input} onChange={e=>update(i,"state",e.target.value)}>
            {STATES.map(s=>(<option key={s}>{s}</option>))}
          </select>
        </div>
      ))}

      <button style={btn} onClick={add}>+ Add Load</button>
      <button style={{...btn,background:"#22c55e"}} onClick={run}>Analyze & Optimize</button>

      {/* RESULTS */}
      {results.map((r,i)=>(
        <div key={i} style={cardDark}>
          <div style={{fontWeight:"bold",fontSize:18}}>#{i+1} {r.decision}</div>
          <div>Adj RPM: ${r.adj.toFixed(2)}</div>
          <div>Profit: ${r.prof.toFixed(0)}</div>
          <div style={{fontSize:13,opacity:0.8}}>Next: {r.next}</div>
        </div>
      ))}

      {/* WEEKLY DASHBOARD */}
      {weekly.revenue>0 && (
        <div style={card}>
          <h3>📊 Weekly Projection</h3>
          <div>Revenue: ${weekly.revenue.toFixed(0)}</div>
          <div>Miles: {weekly.miles}</div>
          <div>Estimated Profit: ${(weekly.revenue - (weekly.miles*COST)).toFixed(0)}</div>
        </div>
      )}
    </div>
  );
}

const card={padding:15,marginBottom:12,background:"#1e293b",borderRadius:12};
const cardDark={padding:15,marginTop:10,background:"#000",borderRadius:12};
const input={display:"block",width:"100%",padding:"10px",marginBottom:"8px",borderRadius:"8px",border:"none"};
const btn={width:"100%",padding:"12px",marginTop:"8px",borderRadius:"10px",border:"none",fontWeight:"bold",background:"#3b82f6",color:"white"}
