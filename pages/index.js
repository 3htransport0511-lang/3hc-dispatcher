import { useState } from "react";

export default function Home(){
  const [rate,setRate]=useState("");
  const [miles,setMiles]=useState("");
  const [deadhead,setDeadhead]=useState("");
  const [state,setState]=useState("");
  const [diesel,setDiesel]=useState(4.0);
  const [mpg,setMpg]=useState(10);
  const [decision,setDecision]=useState("");
  const [history,setHistory]=useState([]);

  const COST = (diesel/mpg) + 0.15 + 0.22;

  const STRONG_MARKETS = ["TX","FL","GA","TN","NC"];

  const analyze = () => {
    const total = Number(miles) + Number(deadhead);
    if(!rate || !total) return;

    const rpm = rate / total;
    const profit = (rpm - COST) * total;

    // 📊 PERFORMANCE LEARNING
    const avgRPM = history.length
      ? history.reduce((sum,l)=>sum+l.rpm,0)/history.length
      : 1.5;

    // 🧠 ADAPTIVE RULES
    let minRPM = 1.5;
    let minProfit = 300;

    if(avgRPM > 1.7){
      minRPM = 1.7;
      minProfit = 400;
    } 
    else if(avgRPM < 1.4){
      minRPM = 1.4;
      minProfit = 250;
    }

    // 🤖 DECISION ENGINE
    let result = "";

    if(rpm >= minRPM && profit >= minProfit){
      result = "🔥 YES – TAKE IT";
    }
    else if(
      rpm >= (minRPM - 0.15) &&
      profit >= (minProfit - 100) &&
      STRONG_MARKETS.includes(state)
    ){
      result = "⚠️ CONDITIONAL";
    }
    else{
      result = "❌ NO – REJECT";
    }

    setDecision(result);

    // 🧠 STORE HISTORY
    setHistory([...history, { rpm, profit, state }]);
  };

  return(
    <div style={{padding:20,background:"#020617",color:"white",minHeight:"100vh"}}>
      <h1>🚛 3HC Adaptive AI</h1>

      <input placeholder="Rate ($)" value={rate} onChange={e=>setRate(e.target.value)} style={input}/>
      <input placeholder="Loaded Miles" value={miles} onChange={e=>setMiles(e.target.value)} style={input}/>
      <input placeholder="Deadhead Miles" value={deadhead} onChange={e=>setDeadhead(e.target.value)} style={input}/>
      <input placeholder="State (TX, FL...)" value={state} onChange={e=>setState(e.target.value.toUpperCase())} style={input}/>

      <h3>⛽ Cost Settings</h3>
      <input value={diesel} onChange={e=>setDiesel(e.target.value)} style={input}/>
      <input value={mpg} onChange={e=>setMpg(e.target.value)} style={input}/>
      <div>Cost/Mile: ${COST.toFixed(2)}</div>

      <button style={btn} onClick={analyze}>Check Load</button>

      {decision && (
        <div style={{...card, fontSize:20, fontWeight:"bold"}}>
          {decision}
        </div>
      )}
    </div>
  );
}

const input={
  display:"block",
  width:"100%",
  padding:"10px",
  marginBottom:"10px",
  borderRadius:"8px"
};

const btn={
  width:"100%",
  padding:"12px",
  marginTop:"10px",
  borderRadius:"10px",
  background:"#3b82f6",
  color:"white",
  fontWeight:"bold"
};

const card={
  marginTop:"20px",
  padding:"20px",
  background:"#1e293b",
  borderRadius:"12px",
  textAlign:"center"
};
