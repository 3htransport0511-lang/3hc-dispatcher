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
    <div style={{padding:20}}>
      <h1>3HC Dispatcher</h1>

      {loads.map((l,i)=>(
        <div key={i} style={{marginBottom:10}}>
          <input placeholder="Rate" onChange={e=>update(i,"rate",e.target.value)} />
          <input placeholder="Miles" onChange={e=>update(i,"miles",e.target.value)} />
          <input placeholder="Deadhead" onChange={e=>update(i,"deadhead",e.target.value)} />
          <input placeholder="State" onChange={e=>update(i,"state",e.target.value)} />
        </div>
      ))}

      <button onClick={add}>+ Add Load</button>
      <button onClick={run}>Analyze</button>

      {results.map((r,i)=>(
        <div key={i} style={{marginTop:10}}>
          <b>#{i+1} {r.decision}</b>
          <p>Adj RPM: {r.adj.toFixed(2)}</p>
          <p>Profit: ${r.prof.toFixed(0)}</p>
          <p>Next: {r.next}</p>
        </div>
      ))}
    </div>
  );
}
