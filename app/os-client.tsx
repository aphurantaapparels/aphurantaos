"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import "./os.css";

type Kind = "client" | "project" | "file" | "account";
type RecordItem = {
  id: string;
  kind: Kind;
  title: string;
  createdAt: string;
  company?: string;
  email?: string;
  phone?: string;
  notes?: string;
  status?: string;
  role?: string;
  budget?: number;
  deadline?: string;
  clientId?: string;
  projectId?: string;
  fileName?: string;
  dataUrl?: string;
  mimeType?: string;
  size?: number;
};
type Store = { records: RecordItem[]; activities: string[]; notifications: string[] };
type View = "Overview" | "Clients" | "Projects" | "Files" | "Accounts" | "Settings";

const emptyStore: Store = { records: [], activities: [], notifications: [] };
const views: { key: View; icon: string; label: string }[] = [
  { key: "Overview", icon: "⌂", label: "Overview" },
  { key: "Clients", icon: "◉", label: "Clients" },
  { key: "Projects", icon: "◇", label: "Projects" },
  { key: "Files", icon: "⌁", label: "Files & pictures" },
  { key: "Accounts", icon: "◎", label: "Accounts" },
];
const statuses = ["Planning", "Active", "On hold", "Complete"];

const makeId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const money = (value: number) => `৳${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(value || 0)}`;
const dateLabel = (value: string) => new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
const bytes = (value = 0) => value < 1024 * 1024 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`;

function normalise(input: Partial<Store>): Store {
  const records = Array.isArray(input.records) ? input.records.filter((record): record is RecordItem => Boolean(record && (record as RecordItem).kind && (record as RecordItem).title)) : [];
  return {
    records,
    activities: records.length && Array.isArray(input.activities) ? input.activities.filter((item): item is string => typeof item === "string") : [],
    notifications: records.length && Array.isArray(input.notifications) ? input.notifications.filter((item): item is string => typeof item === "string") : [],
  };
}

export default function AphurantaOS() {
  const [store, setStore] = useState<Store>(emptyStore);
  const [view, setView] = useState<View>("Overview");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<Kind | null>(null);
  const [toast, setToast] = useState("");
  const loaded = useRef(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/store")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to load workspace")))
      .then((data: Partial<Store>) => { if (mounted) setStore(normalise(data)); })
      .catch(() => {})
      .finally(() => { loaded.current = true; });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const timer = window.setTimeout(() => {
      fetch("/api/store", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(store) }).catch(() => {});
    }, 350);
    return () => window.clearTimeout(timer);
  }, [store]);

  const clients = useMemo(() => store.records.filter((item) => item.kind === "client"), [store.records]);
  const projects = useMemo(() => store.records.filter((item) => item.kind === "project"), [store.records]);
  const files = useMemo(() => store.records.filter((item) => item.kind === "file"), [store.records]);
  const accounts = useMemo(() => store.records.filter((item) => item.kind === "account"), [store.records]);
  const query = search.trim().toLowerCase();
  const filtered = useMemo(() => store.records.filter((item) => !query || Object.values(item).join(" ").toLowerCase().includes(query)), [query, store.records]);
  const metrics = {
    clients: clients.length,
    projects: projects.length,
    activeProjects: projects.filter((item) => item.status === "Active").length,
    budget: projects.reduce((sum, item) => sum + (Number(item.budget) || 0), 0),
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };
  const open = (next: View) => { setView(next); setSearch(""); };
  const addRecord = (record: RecordItem) => {
    setStore((current) => ({ ...current, records: [record, ...current.records], activities: [`${record.title} added`, ...current.activities].slice(0, 30) }));
    setModal(null);
    notify(`${record.title} added`);
  };
  const removeRecord = (id: string) => {
    const item = store.records.find((record) => record.id === id);
    if (!item) return;
    setStore((current) => ({ ...current, records: current.records.filter((record) => record.id !== id), activities: [`${item.title} removed`, ...current.activities].slice(0, 30) }));
    notify("Removed");
  };
  const clientName = (id?: string) => clients.find((client) => client.id === id)?.title || "Unassigned";
  const projectName = (id?: string) => projects.find((project) => project.id === id)?.title || "Unassigned";

  return (
    <main className="os-shell">
      <aside className="os-sidebar">
        <div className="brand"><div className="brand-mark">A</div><div><strong>APHURANTA</strong><small>APPAREL OPERATIONS</small></div></div>
        <nav className="nav-list">
          {views.map((item) => <button key={item.key} className={view === item.key ? "nav-item active" : "nav-item"} onClick={() => open(item.key)}><span>{item.icon}</span>{item.label}{item.key === "Projects" && metrics.activeProjects > 0 ? <b>{metrics.activeProjects}</b> : null}</button>)}
        </nav>
        <div className="sidebar-bottom"><button className={view === "Settings" ? "nav-item active" : "nav-item"} onClick={() => open("Settings")}><span>⚙</span>Settings</button><div className="signed-in"><i>JS</i><div><strong>Jahid S.</strong><small>Administrator</small></div></div></div>
      </aside>

      <section className="os-work">
        <header className="os-top"><div className="mobile-brand"><div className="brand-mark">A</div><strong>APHURANTA</strong></div><label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clients, projects, files…" /><kbd>⌘ K</kbd></label><button className="primary top-add" onClick={() => setModal("client")}>＋ <span>Add new</span></button><div className="top-avatar">JS</div></header>
        {view === "Overview" ? <Overview metrics={metrics} clients={clients} projects={projects} files={files} accounts={accounts} activities={store.activities} open={open} create={setModal} /> : null}
        {view === "Settings" ? <Settings /> : null}
        {view === "Clients" ? <ListPage title="Clients" description="Keep every client profile in one clear place." actionLabel="New client" onAction={() => setModal("client")} rows={filtered.filter((item) => item.kind === "client")} empty="No client profiles yet. Add your first client to begin." render={(item) => <div className="row-main"><div className="avatar">{item.title.slice(0, 1).toUpperCase()}</div><div><strong>{item.title}</strong><small>{item.company || item.email || "No company details"}</small></div></div>} right={(item) => <div className="row-right"><span>{item.phone || item.email || "—"}</span><button className="text-button danger" onClick={() => removeRecord(item.id)}>Remove</button></div>} /> : null}
        {view === "Projects" ? <ListPage title="Projects" description="Track work without the production maze." actionLabel="New project" onAction={() => setModal("project")} rows={filtered.filter((item) => item.kind === "project")} empty="No projects yet. Create one from a client brief." render={(item) => <div className="row-main"><div className="project-dot">◇</div><div><strong>{item.title}</strong><small>{clientName(item.clientId)}{item.deadline ? ` · Due ${dateLabel(item.deadline)}` : ""}</small></div></div>} right={(item) => <div className="row-right"><span className={`status ${item.status?.toLowerCase().replaceAll(" ", "-")}`}>{item.status || "Planning"}</span><span>{money(item.budget || 0)}</span><button className="text-button danger" onClick={() => removeRecord(item.id)}>Remove</button></div>} /> : null}
        {view === "Files" ? <ListPage title="Files & pictures" description="Attach references, tech packs, and images to the right project." actionLabel="Add file or picture" onAction={() => setModal("file")} rows={filtered.filter((item) => item.kind === "file")} empty="No files yet. Add a picture or document to your workspace." render={(item) => <div className="row-main">{item.mimeType?.startsWith("image/") && item.dataUrl ? <img className="file-thumb" src={item.dataUrl} alt="" /> : <div className="file-icon">{item.mimeType?.startsWith("image/") ? "▧" : "▤"}</div>}<div><strong>{item.fileName || item.title}</strong><small>{projectName(item.projectId)} · {bytes(item.size)}</small></div></div>} right={(item) => <div className="row-right">{item.dataUrl ? <a className="text-button" href={item.dataUrl} download={item.fileName || item.title}>Download</a> : null}<button className="text-button danger" onClick={() => removeRecord(item.id)}>Remove</button></div>} /> : null}
        {view === "Accounts" ? <ListPage title="Accounts" description="Manage the people who can work in this workspace." actionLabel="Add account" onAction={() => setModal("account")} rows={filtered.filter((item) => item.kind === "account")} empty="No team accounts yet. Add the people who need access." render={(item) => <div className="row-main"><div className="avatar dark">{item.title.slice(0, 1).toUpperCase()}</div><div><strong>{item.title}</strong><small>{item.email || "No email added"}</small></div></div>} right={(item) => <div className="row-right"><span>{item.role || "Member"}</span><span className={`status ${item.status?.toLowerCase()}`}>{item.status || "Active"}</span><button className="text-button danger" onClick={() => removeRecord(item.id)}>Remove</button></div>} /> : null}
      </section>
      {modal ? <CreateModal kind={modal} clients={clients} projects={projects} onClose={() => setModal(null)} onSave={addRecord} /> : null}
      {toast ? <div className="toast">{toast}</div> : null}
    </main>
  );
}

function Overview({ metrics, clients, projects, files, accounts, activities, open, create }: { metrics: { clients: number; projects: number; activeProjects: number; budget: number }; clients: RecordItem[]; projects: RecordItem[]; files: RecordItem[]; accounts: RecordItem[]; activities: string[]; open: (view: View) => void; create: (kind: Kind) => void }) {
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">Workspace overview</p><h1>Good morning, Jahid.</h1><p className="muted">A simple view of what is actually saved in Aphuranta.</p></div><button className="primary" onClick={() => create("client")}>＋ Add something</button></div><div className="metric-grid"><Metric label="Clients" value={String(metrics.clients)} hint="Saved profiles" /><Metric label="Projects" value={String(metrics.projects)} hint={`${metrics.activeProjects} active`} /><Metric label="Planned budget" value={money(metrics.budget)} hint="From project budgets" dark /><Metric label="Files & pictures" value={String(files.length)} hint="Attached workspace files" /></div><div className="overview-grid"><section className="panel quick-panel"><div className="panel-heading"><div><h2>Start here</h2><p className="muted">Choose the next thing you want to add.</p></div></div><div className="quick-actions"><button onClick={() => create("client")}><span>◉</span><strong>Client profile</strong><small>Name, contact, notes</small></button><button onClick={() => create("project")}><span>◇</span><strong>Project</strong><small>Client, budget, deadline</small></button><button onClick={() => create("file")}><span>⌁</span><strong>File or picture</strong><small>Reference or tech pack</small></button><button onClick={() => create("account")}><span>◎</span><strong>Team account</strong><small>Role and access list</small></button></div></section><section className="panel"><div className="panel-heading"><div><h2>Recent activity</h2><p className="muted">Your latest changes</p></div></div>{activities.length ? <div className="activity-list">{activities.slice(0, 6).map((item, index) => <div className="activity" key={`${item}-${index}`}><i>•</i><div><strong>{item}</strong><small>Saved to workspace</small></div></div>)}</div> : <Empty title="Nothing saved yet" text="New records will appear here." />}</section></div><section className="panel snapshot"><div className="panel-heading"><div><h2>Workspace snapshot</h2><p className="muted">Everything currently stored</p></div></div><div className="snapshot-grid"><button onClick={() => open("Clients")}><strong>{clients.length}</strong><span>clients</span><em>View clients →</em></button><button onClick={() => open("Projects")}><strong>{projects.length}</strong><span>projects</span><em>View projects →</em></button><button onClick={() => open("Files")}><strong>{files.length}</strong><span>files & pictures</span><em>View files →</em></button><button onClick={() => open("Accounts")}><strong>{accounts.length}</strong><span>team accounts</span><em>View accounts →</em></button></div></section></div>;
}

function Metric({ label, value, hint, dark = false }: { label: string; value: string; hint: string; dark?: boolean }) { return <div className={dark ? "metric dark" : "metric"}><small>{label}</small><strong>{value}</strong><span>{hint}</span></div>; }
function Empty({ title, text }: { title: string; text: string }) { return <div className="empty"><strong>{title}</strong><span>{text}</span></div>; }
function ListPage({ title, description, actionLabel, onAction, rows, empty, render, right }: { title: string; description: string; actionLabel: string; onAction: () => void; rows: RecordItem[]; empty: string; render: (item: RecordItem) => ReactNode; right: (item: RecordItem) => ReactNode }) { return <div className="page"><div className="page-heading"><div><p className="eyebrow">Workspace</p><h1>{title}</h1><p className="muted">{description}</p></div><button className="primary" onClick={onAction}>＋ {actionLabel}</button></div><section className="panel list-panel"><div className="list-count">{rows.length} {rows.length === 1 ? "record" : "records"}</div>{rows.length ? <div className="rows">{rows.map((item) => <div className="data-row" key={item.id}>{render(item)}{right(item)}</div>)}</div> : <Empty title="Nothing here yet" text={empty} />}</section></div>; }

function Settings() { return <div className="page"><div className="page-heading"><div><p className="eyebrow">Workspace</p><h1>Settings</h1><p className="muted">Keep the workspace intentional and easy to use.</p></div></div><section className="panel settings-card"><div><span className="settings-icon">⚙</span><div><h2>Simple workspace mode</h2><p className="muted">Aphuranta now focuses on the records you asked for. Dashboard numbers are derived from saved clients, projects, files, and accounts—there are no demo amounts or placeholder counts.</p></div></div><div className="setting-line"><span>Storage</span><strong>MongoDB workspace</strong></div><div className="setting-line"><span>Image and file limit</span><strong>4 MB per attachment</strong></div></section></div>; }

function CreateModal({ kind, clients, projects, onClose, onSave }: { kind: Kind; clients: RecordItem[]; projects: RecordItem[]; onClose: () => void; onSave: (record: RecordItem) => void }) {
  const [values, setValues] = useState<Record<string, string>>({ status: "Planning", role: "Member", accountStatus: "Active" });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const set = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const onFile = (event: ChangeEvent<HTMLInputElement>) => { const selected = event.target.files?.[0]; if (!selected) return; if (selected.size > 4 * 1024 * 1024) { setError("Please choose a file smaller than 4 MB."); return; } setError(""); setFile(selected); };
  const submit = (event: FormEvent) => { event.preventDefault(); const title = kind === "file" ? file?.name : values.name?.trim(); if (!title) { setError(kind === "file" ? "Choose a file first." : "Add a name first."); return; } const base: RecordItem = { id: makeId(kind), kind, title, createdAt: new Date().toISOString() }; if (kind === "client") onSave({ ...base, company: values.company, email: values.email, phone: values.phone, notes: values.notes }); if (kind === "project") onSave({ ...base, clientId: values.clientId || undefined, status: values.status, budget: Number(values.budget) || 0, deadline: values.deadline, notes: values.notes }); if (kind === "account") onSave({ ...base, email: values.email, role: values.role, status: values.accountStatus }); if (kind === "file" && file) { const reader = new FileReader(); reader.onload = () => onSave({ ...base, fileName: file.name, mimeType: file.type, size: file.size, dataUrl: typeof reader.result === "string" ? reader.result : undefined, projectId: values.projectId || undefined }); reader.readAsDataURL(file); } };
  const labels: Record<Kind, string> = { client: "New client", project: "New project", file: "Add file or picture", account: "Add team account" };
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><form className="modal" onSubmit={submit}><div className="modal-heading"><div><p className="eyebrow">Add to workspace</p><h2>{labels[kind]}</h2></div><button type="button" className="close" onClick={onClose}>×</button></div>{kind === "client" ? <><Field label="Full name" value={values.name || ""} onChange={(value) => set("name", value)} placeholder="e.g. Amina Rahman" required /><div className="form-grid"><Field label="Company" value={values.company || ""} onChange={(value) => set("company", value)} placeholder="Company name" /><Field label="Phone" value={values.phone || ""} onChange={(value) => set("phone", value)} placeholder="+880…" /></div><Field label="Email" value={values.email || ""} onChange={(value) => set("email", value)} placeholder="name@company.com" type="email" /><TextArea label="Notes" value={values.notes || ""} onChange={(value) => set("notes", value)} placeholder="Anything useful to remember" /></> : null}{kind === "project" ? <><Field label="Project name" value={values.name || ""} onChange={(value) => set("name", value)} placeholder="e.g. Winter collection" required /><div className="form-grid"><Select label="Client" value={values.clientId || ""} onChange={(value) => set("clientId", value)} options={[{ label: "Unassigned", value: "" }, ...clients.map((client) => ({ label: client.title, value: client.id }))]} /><Select label="Status" value={values.status || "Planning"} onChange={(value) => set("status", value)} options={statuses.map((status) => ({ label: status, value: status }))} /></div><div className="form-grid"><Field label="Budget (৳)" value={values.budget || ""} onChange={(value) => set("budget", value)} placeholder="0" type="number" min="0" /><Field label="Deadline" value={values.deadline || ""} onChange={(value) => set("deadline", value)} type="date" /></div><TextArea label="Notes" value={values.notes || ""} onChange={(value) => set("notes", value)} placeholder="What needs to be done?" /></> : null}{kind === "account" ? <><Field label="Name" value={values.name || ""} onChange={(value) => set("name", value)} placeholder="Team member name" required /><Field label="Email" value={values.email || ""} onChange={(value) => set("email", value)} placeholder="name@aphuranta.com" type="email" required /><div className="form-grid"><Select label="Role" value={values.role || "Member"} onChange={(value) => set("role", value)} options={["Administrator", "Manager", "Member"].map((role) => ({ label: role, value: role }))} /><Select label="Status" value={values.accountStatus || "Active"} onChange={(value) => set("accountStatus", value)} options={["Active", "Invited", "Paused"].map((status) => ({ label: status, value: status }))} /></div></> : null}{kind === "file" ? <><label className="upload-box"><input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip" onChange={onFile} /><span className="upload-icon">⌁</span><strong>{file ? file.name : "Choose a file or picture"}</strong><small>{file ? bytes(file.size) : "Images, tech packs, PDFs, and documents up to 4 MB"}</small></label><Select label="Attach to project" value={values.projectId || ""} onChange={(value) => set("projectId", value)} options={[{ label: "No project", value: "" }, ...projects.map((project) => ({ label: project.title, value: project.id }))]} /></> : null}{error ? <p className="form-error">{error}</p> : null}<div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button type="submit" className="primary">Save {kind === "file" ? "file" : kind}</button></div></form></div>;
}

function Field({ label, value, onChange, placeholder, type = "text", required = false, min }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean; min?: string }) { return <label className="field"><span>{label}</span><input required={required} type={type} min={min} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>; }
function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) { return <label className="field"><span>{label}</span><textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} rows={3} /></label>; }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { label: string; value: string }[] }) { return <label className="field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }
