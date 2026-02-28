import { useState } from "react";

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

  const COST=0.82;

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
        adj,
        prof,
        decision: adj>=1.5?"BOOK IT":adj>=1.2?"CONSIDER":"REJECT",
        next:nextMove(l.state)
      };
    }).filter(Boolean).sort((a,b)=>b.adj-a.adj);

    setResults(res);
  };

  return(
    <div style={{padding:20, fontFamily:"Arial", background:"#0f172a", minHeight:"100vh", color:"white"}}>
      <h1 style={{fontSize:28, fontWeight:"bold", marginBottom:20}}>🚛 3HC Dispatcher</h1>

      {loads.map((l,i)=>(
        <div key={i} style={{marginBottom:15, padding:15, background:"#1e293b", borderRadius:12}}>
          <input placeholder="Rate ($)" style={input} onChange={e=>update(i,"rate",e.target.value)} />
          <input placeholder="Loaded Miles" style={input} onChange={e=>update(i,"miles",e.target.value)} />
          <input placeholder="Deadhead Miles" style={input} onChange={e=>update(i,"deadhead",e.target.value)} />
          <select style={input} onChange={e=>update(i,"state",e.target.value)}>
            {["FL","GA","TN","NC","TX","SC","AL","VA","KY","OK","MO","KS","AR"].map(s=>(
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      ))}

      <button style={btn} onClick={add}>+ Add Load</button>
      <button style={{...btn, background:"#22c55e"}} onClick={run}>Analyze Loads</button>

      {results.map((r,i)=>(
        <div key={i} style={{marginTop:15, padding:15, background:"#020617", borderRadius:12}}>
          <div style={{fontWeight:"bold", fontSize:18}}>#{i+1} {r.decision}</div>
          <div>Adj RPM: ${r.adj.toFixed(2)}</div>
          <div>Profit: ${r.prof.toFixed(0)}</div>
          <div style={{fontSize:13, opacity:0.8}}>Next: {r.next}</div>
        </div>
      ))}
    </div>
  );
}

const input = {
  display:"block",
  width:"100%",
  padding:"10px",
  marginBottom:"8px",
  borderRadius:"8px",
  border:"none",
  fontSize:"16px"
};

const btn = {
  width:"100%",
  padding:"12px",
  marginTop:"8px",
  borderRadius:"10px",
  border:"none",
  fontSize:"16px",
  fontWeight:"bold",
  background:"#3b82f6",
  color:"white"
};
