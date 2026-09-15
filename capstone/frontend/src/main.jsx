import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App(){
  const [recalls,setRecalls]=useState([]); const [loading,setLoading]=useState(true); const [message,setMessage]=useState('');
  const [form,setForm]=useState({product_name:'',batch_number:'',severity:'MEDIUM',reason:'',affected_customers:0});
  const load=()=>fetch(`${API}/api/recalls`).then(r=>r.json()).then(setRecalls).finally(()=>setLoading(false));
  useEffect(()=>{load()},[]);
  const update=(e)=>setForm({...form,[e.target.name]:e.target.value});
  const create=async(e)=>{e.preventDefault();setMessage('');const r=await fetch(`${API}/api/recalls`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,affected_customers:Number(form.affected_customers)})});if(!r.ok){setMessage('Please check the form and try again.');return;}setForm({product_name:'',batch_number:'',severity:'MEDIUM',reason:'',affected_customers:0});setMessage('Draft created successfully.');load()};
  const publish=async(id)=>{await fetch(`${API}/api/recalls/${id}/publish`,{method:'POST'});setMessage('Recall published.');load()};
  return <main><header><div><p className="eyebrow">CLOUD CAPSTONE</p><h1>Pharma Recall Console</h1><p className="sub">Create, publish and monitor product recalls.</p></div><span className="status">● API connected</span></header>
  <section className="grid"><form className="panel" onSubmit={create}><h2>Create recall</h2><label>Product name<input name="product_name" value={form.product_name} onChange={update} required placeholder="e.g. Paracetamol 500mg"/></label><label>Batch number<input name="batch_number" value={form.batch_number} onChange={update} required placeholder="e.g. BTH-2026-001"/></label><label>Severity<select name="severity" value={form.severity} onChange={update}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select></label><label>Affected customers<input type="number" min="0" name="affected_customers" value={form.affected_customers} onChange={update}/></label><label>Reason<textarea name="reason" value={form.reason} onChange={update} required placeholder="Explain why this recall is needed"/></label><button>Create draft</button>{message&&<p className="message">{message}</p>}</form>
  <section className="panel"><div className="section-head"><h2>Recall register</h2><button className="secondary" onClick={load}>Refresh</button></div>{loading?<p>Loading recalls…</p>:recalls.length===0?<div className="empty">No recalls yet. Create your first draft.</div>:<div className="table-wrap"><table><thead><tr><th>Product</th><th>Batch</th><th>Severity</th><th>Status</th><th>Action</th></tr></thead><tbody>{recalls.map(r=><tr key={r.id}><td><strong>{r.product_name}</strong><small>{r.reason}</small></td><td>{r.batch_number}</td><td><span className={`pill ${r.severity.toLowerCase()}`}>{r.severity}</span></td><td><span className="pill">{r.status}</span></td><td>{r.status==='DRAFT'?<button onClick={()=>publish(r.id)}>Publish</button>:<span className="muted">Published</span>}</td></tr>)}</tbody></table></div>}</section></section></main>
}
createRoot(document.getElementById('root')).render(<App/>);
