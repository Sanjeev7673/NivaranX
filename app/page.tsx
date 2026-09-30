"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type View = "dashboard" | "new" | "cases" | "rights" | "grievance" | "settings";
type CaseItem = { id: string; title: string; category: string; readiness: number; status: string; createdAt: string; data?: any };

const NAV: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "new", label: "New case", icon: "+" },
  { id: "cases", label: "My cases", icon: "▣" },
  { id: "rights", label: "Rights navigator", icon: "◈" },
  { id: "grievance", label: "Grievance assistant", icon: "✎" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

const FEATURES = [
  ["01", "Case reconstruction", "Turn a plain-language complaint into a clear incident timeline."],
  ["02", "Evidence intelligence", "Identify what supports the case and what information is still missing."],
  ["03", "Rights navigation", "Surface the relevant official pathway without inventing regulatory claims."],
];

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [story, setStory] = useState("");
  const [result, setResult] = useState<any>(null);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try { setCases(JSON.parse(localStorage.getItem("nivaran-cases") || "[]")); } catch { setCases([]); }
  }, []);

  useEffect(() => { localStorage.setItem("nivaran-cases", JSON.stringify(cases)); }, [cases]);

  const latest = useMemo(() => cases[0], [cases]);

  function go(next: View) { setView(next); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); }

  async function analyze(event?: FormEvent) {
    event?.preventDefault();
    if (!story.trim() || loading) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/agents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ story: story.trim() }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Analysis failed. Please try again.");
      const data = payload.case || payload;
      setResult(data);
      const item: CaseItem = { id: data.caseId || `NV-${Date.now()}`, title: story.trim().slice(0, 58), category: data.category || "Investor issue", readiness: Number(data.readiness || data.readiness_score || 0), status: "Analyzed", createdAt: new Date().toLocaleString(), data };
      setCases(prev => [item, ...prev.filter(c => c.id !== item.id)].slice(0, 20));
      setView("cases");
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <div className="nx-shell">
      <aside className="nx-sidebar">
        <div className="nx-brand" onClick={() => go("dashboard")} role="button" tabIndex={0}>
          <span className="nx-mark">NX</span><span><b>NIVARAN X</b><small>Investor rights intelligence</small></span>
        </div>
        <div className="nx-track">TRACK B <span>INVESTOR AWARENESS</span></div>
        <nav aria-label="Primary navigation">
          {NAV.map(item => <button key={item.id} onClick={() => go(item.id)} className={view === item.id ? "nx-nav active" : "nx-nav"}><i>{item.icon}</i><span>{item.label}</span></button>)}
        </nav>
        <div className="nx-safe"><strong>● Protection active</strong><span>Privacy-first architecture</span><span>AI guardrails enabled</span></div>
      </aside>

      <main className="nx-main">
        <header className="nx-header"><div><span className="eyebrow">NIVARAN X / {view.replace("-", " ")}</span><h1>{NAV.find(n => n.id === view)?.label}</h1></div><div className="system"><span className="dot"/> System ready</div></header>

        <div className="nx-content">
          {view === "dashboard" && <Dashboard latest={latest} go={go} />}
          {view === "new" && <NewCase story={story} setStory={setStory} analyze={analyze} loading={loading} error={error} />}
          {view === "cases" && <Cases cases={cases} result={result} go={go} />}
          {view === "rights" && <Rights />}
          {view === "grievance" && <Grievance latest={latest} go={go} />}
          {view === "settings" && <Settings />}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ latest, go }: { latest?: CaseItem; go: (v: View) => void }) {
  return <>
    <section className="hero-panel">
      <div className="hero-copy"><span className="eyebrow light">INVESTOR RESILIENCE</span><h2>From a confusing complaint to a clear, evidence-led action path.</h2><p>NIVARAN X helps investors structure what happened, identify information gaps, understand the appropriate official grievance pathway and prepare for the next step.</p><button className="cta" onClick={() => go("new")}>Start a new case <b>→</b></button></div>
      <div className="hero-metrics"><Metric value="6" label="AI modules"/><Metric value="5" label="Safety checks"/><Metric value="1" label="Unified case view"/></div>
    </section>
    <section className="section-head"><div><span className="eyebrow">CORE CAPABILITIES</span><h2>Designed around the investor journey</h2></div><button className="text-btn" onClick={() => go("rights")}>Explore rights navigator →</button></section>
    <div className="feature-grid">{FEATURES.map(([n,t,d]) => <article className="feature" key={n}><span className="feature-num">{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
    <section className="lower-grid"><div className="surface"><div className="surface-head"><div><span className="eyebrow">RECENT CASE</span><h3>{latest ? latest.title : "No case analyzed yet"}</h3></div><button className="text-btn" onClick={() => go(latest ? "cases" : "new")}>{latest ? "Open case →" : "Create case →"}</button></div>{latest ? <div className="case-summary"><span>{latest.category}</span><b>{latest.readiness}%</b><small>information readiness</small></div> : <p className="muted">Your first case will appear here after analysis.</p>}</div><div className="surface safety"><span className="eyebrow">SAFETY BY DESIGN</span><h3>AI assists. Official sources decide.</h3><p>NIVARAN X does not provide individualized investment advice, guarantee grievance outcomes or turn uncertain information into facts.</p></div></section>
  </>;
}
function Metric({ value, label }: { value: string; label: string }) { return <div><strong>{value}</strong><span>{label}</span></div>; }

function NewCase({ story, setStory, analyze, loading, error }: any) {
  const samples = ["My broker deducted ₹2,500 from my account. I contacted customer care but they have not explained the deduction.", "I submitted a complaint to my intermediary but have not received a response. I want to understand the next official grievance step."];
  return <section className="workspace"><div className="workspace-head"><div><span className="eyebrow">STEP 1 / CASE INTAKE</span><h2>Tell us what happened</h2><p>Describe the issue in your own words. Keep passwords, OTPs, PINs and unrelated personal information out of the description.</p></div><span className="step-pill">1 / 3</span></div><form onSubmit={analyze}><label htmlFor="story">Investor complaint</label><textarea id="story" value={story} onChange={(e) => setStory(e.target.value)} placeholder="Example: My broker deducted ₹2,500 from my account..." autoFocus /><div className="samples"><span>Try an example:</span>{samples.map((s,i)=><button type="button" key={i} onClick={() => setStory(s)}>{i === 0 ? "Unexpected deduction" : "Unresolved complaint"}</button>)}</div>{error && <div className="error">{error}</div>}<div className="form-actions"><span>Analysis will run securely on the server.</span><button className="cta" disabled={!story.trim() || loading}>{loading ? "Analyzing case…" : "Analyze my case →"}</button></div></form><div className="process"><Process n="01" title="Structure"/><Process n="02" title="Verify"/><Process n="03" title="Navigate"/></div></section>;
}
function Process({ n, title }: { n: string; title: string }) { return <div><span>{n}</span><b>{title}</b></div>; }

function Cases({ cases, result, go }: { cases: CaseItem[]; result: any; go: (v: View) => void }) {
  const active = result || cases[0]?.data;
  return <section><div className="section-head"><div><span className="eyebrow">CASE MANAGEMENT</span><h2>Your cases</h2></div><button className="cta compact" onClick={() => go("new")}>+ New case</button></div>{active && <CaseDetail data={active} />}{cases.length === 0 ? <div className="empty"><span>◌</span><h3>No cases yet</h3><p>Start with a plain-language investor complaint.</p><button className="cta compact" onClick={() => go("new")}>Create first case</button></div> : <div className="case-list">{cases.map(c => <button key={c.id} className="case-row" onClick={() => { window.scrollTo({top:0,behavior:"smooth"}); }}><span><b>{c.id}</b><small>{c.title}</small></span><span>{c.category}</span><strong>{c.readiness}%</strong></button>)}</div>}</section>;
}
function CaseDetail({ data }: { data: any }) { return <article className="detail"><div className="detail-top"><div><span className="eyebrow">CASE {data.caseId}</span><h3>{data.issue}</h3></div><div className="readiness"><strong>{data.readiness ?? data.readiness_score ?? 0}%</strong><span>information readiness</span></div></div><div className="detail-grid"><Panel title="Case reconstruction"><p><b>Category:</b> {data.category || "Not classified"}</p><p><b>Entity:</b> {data.entity || "Not identified"}</p><p><b>Timeline:</b> {data.timeline || "Not provided"}</p><p><b>Requested resolution:</b> {data.requestedResolution || "Not provided"}</p></Panel><Panel title="Information gaps">{(data.missing || data.missing_information || []).length ? (data.missing || data.missing_information).map((x: string) => <div className="gap" key={x}>! {x}</div>) : <div className="success">✓ No identified gaps</div>}</Panel></div><Panel title="Agent trace"><div className="trace">{(data.agentTrace || []).map((a: any) => <div key={a.agent}><b>{a.agent}</b><span>{a.note}</span><em>{a.status}</em></div>)}</div></Panel>{data.nextAction && <div className="next-action"><span className="eyebrow">RECOMMENDED NEXT STEP</span><p>{data.nextAction}</p></div>}<div className="detail-footer"><span>Source-grounded navigation only</span>{data.sources?.[0]?.url && <a href={data.sources[0].url} target="_blank" rel="noreferrer">Open official source ↗</a>}</div></article>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="detail-panel"><h4>{title}</h4>{children}</div>; }

function Rights() { return <section className="workspace"><span className="eyebrow">RIGHTS & GRIEVANCE PATHWAYS</span><h2>Source-grounded navigation</h2><p className="lead">This area helps organize the procedural path for an investor issue. It is not a substitute for the current rules or official instructions of the relevant authority.</p><div className="rights-grid"><div className="right-card"><span>01</span><h3>Identify the intermediary</h3><p>Start with the entity involved in the transaction or complaint.</p></div><div className="right-card"><span>02</span><h3>Preserve the record</h3><p>Keep transaction records, complaint acknowledgements and relevant communications.</p></div><div className="right-card"><span>03</span><h3>Use the official route</h3><p>Verify the applicable grievance mechanism using the authority's current official source.</p></div></div><div className="source-card"><div><span className="eyebrow">OFFICIAL SOURCE</span><h3>SEBI SCORES</h3><p>Use the official grievance platform when it is the applicable mechanism for the case.</p></div><a href="https://scores.sebi.gov.in/" target="_blank" rel="noreferrer" className="cta compact">Open official source ↗</a></div></section>; }

function Grievance({ latest, go }: { latest?: CaseItem; go: (v: View) => void }) { return <section className="workspace"><span className="eyebrow">GRIEVANCE ASSISTANT</span><h2>Prepare before you submit</h2><p className="lead">NIVARAN organizes facts, evidence and the requested resolution into a reviewable case. It does not promise an outcome.</p><div className="checklist"><Check text="Incident and entity are clearly identified"/><Check text="Relevant transaction or complaint references are collected"/><Check text="Supporting evidence is preserved"/><Check text="The applicable official route is verified"/></div>{latest ? <div className="draft-box"><span className="eyebrow">ACTIVE CASE</span><h3>{latest.id}</h3><p>{latest.data?.nextAction || "Review the case information and collect any missing details before proceeding."}</p><button className="text-btn" onClick={() => go("cases")}>Review case →</button></div> : <button className="cta" onClick={() => go("new")}>Start with a new case →</button>}</section>; }
function Check({ text }: { text: string }) { return <div><span>✓</span>{text}</div>; }
function Settings() { return <section className="workspace settings"><span className="eyebrow">PREFERENCES</span><h2>Privacy & accessibility</h2><div className="setting"><div><b>Language</b><span>English · Regional language support ready</span></div><select defaultValue="English"><option>English</option><option>Tamil</option><option>Hindi</option></select></div><div className="setting"><div><b>Privacy mode</b><span>Do not enter passwords, OTPs, PINs or unnecessary identifiers.</span></div><strong className="enabled">Enabled</strong></div><div className="setting"><div><b>Accessibility</b><span>Responsive layout, keyboard-friendly controls and clear status states.</span></div><strong className="enabled">Ready</strong></div></section>; }
