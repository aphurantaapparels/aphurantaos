"use client";

import { useMemo, useState } from "react";

const nav = ["Dashboard", "CRM", "Clients", "Orders", "Production", "Samples", "Costings", "Quotations", "Calendar", "Invoices", "Vendors", "Tasks", "Reports", "Files"];
const quickActions = ["Lead", "Client", "Quotation", "Order", "Production update", "Sample", "Payment", "Task", "Meeting"];
const records = [
  { type: "Order", id: "APH-ORD-2026-1042", name: "ABC Fashion", meta: "500 pcs • In production" },
  { type: "Invoice", id: "APH-INV-2026-1042", name: "ABC Fashion", meta: "৳105,000 outstanding" },
  { type: "Production", id: "APH-PJ-2026-1042", name: "Black oversized tee", meta: "Sewing • 72%" },
  { type: "Client", id: "01712345678", name: "Rahim • ABC Fashion", meta: "Primary contact" },
];

const jobs = [
  { id: "APH-PJ-1042", client: "ABC Fashion", product: "Oversized Tee", qty: "500 pcs", stage: "Sewing", progress: 72, due: "26 Aug", tone: "red" },
  { id: "APH-PJ-1038", client: "Northstar Retail", product: "Heavyweight Hoodie", qty: "320 pcs", stage: "Finishing", progress: 86, due: "22 Aug", tone: "amber" },
  { id: "APH-PJ-1034", client: "Mora Studio", product: "Team Jersey", qty: "180 pcs", stage: "QC", progress: 92, due: "19 Aug", tone: "green" },
];

const deadlines = [
  { day: "18", mon: "AUG", title: "Sample approval", sub: "Mora Studio • APH-SMP-1008", tag: "Today" },
  { day: "19", mon: "AUG", title: "Payment follow-up", sub: "ABC Fashion • ৳105,000", tag: "Tomorrow" },
  { day: "22", mon: "AUG", title: "Production deadline", sub: "Northstar • APH-PJ-1038", tag: "4 days" },
];

export default function Home() {
  const [quickOpen, setQuickOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const results = useMemo(() => query.trim() ? records.filter((r) => Object.values(r).join(" ").toLowerCase().includes(query.toLowerCase())) : records, [query]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">A</span><div><strong>APHURANTA</strong><small>APPAREL OPERATIONS</small></div></div>
        <nav>{nav.map((item, index) => <button key={item} className={index === 0 ? "active" : ""} onClick={() => notify(`${item} module is queued for Phase 1`)}><span>{["⌂","◎","◉","□","◇","△","◌","▱","◫","▤","⬡","✓","◒","⌁"][index]}</span>{item}{item === "Tasks" && <b>6</b>}</button>)}</nav>
        <div className="sidebar-foot"><div className="avatar">JS</div><div><strong>Jahid S.</strong><small>Administrator</small></div><button aria-label="Settings">•••</button></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="mobile-logo"><span className="brand-mark">A</span><strong>APHURANTA</strong></div>
          <button className="search-trigger" onClick={() => setSearchOpen(true)}><span>⌕</span><span>Search clients, orders, invoices...</span><kbd>⌘ K</kbd></button>
          <div className="top-actions"><button className="create-button" onClick={() => setQuickOpen(true)}>＋ <span>Quick create</span></button><button className="icon-button" aria-label="Notifications">♢<i /></button><div className="avatar small">JS</div></div>
        </header>

        <div className="content">
          <div className="page-heading"><div><p className="eyebrow">SUNDAY, 16 AUGUST</p><h1>Good morning, Jahid.</h1><p>Here’s the pulse of Aphuranta today.</p></div><button className="range">This month⌄</button></div>

          <section className="kpi-grid">
            <article className="kpi hero-kpi"><div className="kpi-top"><span>Revenue</span><i className="up">↗ 8.2%</i></div><strong>৳18.4L</strong><p>৳1,840,000 this month</p><div className="spark"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
            <article className="kpi"><div className="kpi-top"><span>Active orders</span><em className="metric-icon">□</em></div><strong>12</strong><p><b>4</b> due this week</p></article>
            <article className="kpi"><div className="kpi-top"><span>Outstanding</span><em className="metric-icon">৳</em></div><strong>৳4.2L</strong><p><b className="danger">৳85K</b> overdue</p></article>
            <article className="kpi"><div className="kpi-top"><span>Active production</span><em className="metric-icon">◇</em></div><strong>8</strong><p><b>2</b> need attention</p></article>
          </section>

          <section className="today-strip"><div><span className="pulse"/><strong>Today</strong></div><button><b>3</b> Follow-ups <span>›</span></button><button><b>2</b> Production deadlines <span>›</span></button><button><b>1</b> Payment due <span>›</span></button></section>

          <div className="dashboard-grid">
            <section className="panel production-panel"><div className="panel-head"><div><p className="eyebrow">LIVE OPERATIONS</p><h2>Active production</h2></div><button onClick={() => notify("Production module is queued for Phase 1")}>View all <span>→</span></button></div>
              <div className="jobs">{jobs.map(job => <article className="job" key={job.id}><div className="job-head"><div><span className={`status ${job.tone}`}>{job.stage}</span><small>{job.id}</small></div><button aria-label={`Open ${job.id}`} onClick={() => notify(`Opening ${job.id}`)}>•••</button></div><h3>{job.client}</h3><p>{job.product} <span>•</span> {job.qty}</p><div className="progress-label"><span>Progress</span><strong>{job.progress}%</strong></div><div className="progress"><i style={{width: `${job.progress}%`}}/></div><footer><span>Delivery</span><strong>{job.due}</strong><button onClick={() => notify(`${job.id} selected`)}>View job →</button></footer></article>)}</div>
            </section>

            <section className="panel deadline-panel"><div className="panel-head"><div><p className="eyebrow">COMING UP</p><h2>Deadlines</h2></div><button>Calendar <span>→</span></button></div><div className="deadline-list">{deadlines.map(item => <article key={item.title}><div className="date-card"><b>{item.day}</b><span>{item.mon}</span></div><div><h3>{item.title}</h3><p>{item.sub}</p></div><span className="tag">{item.tag}</span></article>)}</div><button className="full-button" onClick={() => notify("Meeting creator opened")}>＋ Schedule a meeting</button></section>
          </div>

          <section className="panel pipeline-panel"><div className="panel-head"><div><p className="eyebrow">SALES</p><h2>Pipeline</h2></div><strong>৳12.8L <small>weighted value</small></strong></div><div className="pipeline-bars">{[["New lead",14,"৳2.1L"],["Qualified",8,"৳3.4L"],["Quotation",6,"৳4.2L"],["Negotiation",3,"৳2.3L"],["Sample",4,"৳80K"]].map(([label,count,value],i)=><div key={label as string}><span>{label}</span><strong>{count}</strong><div><i style={{width:`${84-i*12}%`}}/></div><small>{value}</small></div>)}</div></section>
        </div>
      </section>

      <button className="mobile-fab" aria-label="Quick create" onClick={() => setQuickOpen(true)}>＋</button>
      <nav className="bottom-nav"><button className="active"><span>⌂</span>Home</button><button><span>◎</span>CRM</button><button className="nav-space" aria-hidden="true"/><button><span>□</span>Orders</button><button onClick={() => notify("More modules coming in Phase 1")}><span>☰</span>More</button></nav>

      {quickOpen && <div className="overlay" onMouseDown={() => setQuickOpen(false)}><section className="sheet" onMouseDown={e => e.stopPropagation()}><div className="sheet-handle"/><header><div><p className="eyebrow">ADD TO APHURANTA</p><h2>Quick create</h2></div><button onClick={() => setQuickOpen(false)}>×</button></header><div className="quick-grid">{quickActions.map((action,i)=><button key={action} onClick={() => {setQuickOpen(false); notify(`${action} form opened`)}}><span>{["◎","◉","▱","□","◇","◌","৳","✓","◫"][i]}</span>{action}</button>)}</div></section></div>}

      {searchOpen && <div className="overlay search-overlay" onMouseDown={() => setSearchOpen(false)}><section className="search-modal" onMouseDown={e=>e.stopPropagation()}><div className="search-input"><span>⌕</span><input autoFocus placeholder="Search Aphuranta..." value={query} onChange={e=>setQuery(e.target.value)}/><button onClick={()=>setSearchOpen(false)}>ESC</button></div><p className="search-hint">CLIENTS, ORDERS, INVOICES & JOBS</p>{results.map(r=><button className="result" key={r.type+r.id} onClick={()=>{setSearchOpen(false);notify(`${r.id} selected`)}}><span>{r.type.slice(0,1)}</span><div><strong>{r.name}</strong><small>{r.id} • {r.meta}</small></div><b>→</b></button>)}{results.length===0 && <div className="empty">No matching records found.</div>}</section></div>}
      {toast && <div className="toast">✓ {toast}</div>}
    </main>
  );
}
