import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AlertCircle, ArrowLeft, ClipboardList, ExternalLink, FileImage, Filter, LogIn, MapPin, RefreshCw, Search, ShieldCheck, Save, History } from "lucide-react";
import { AuthPanel } from "../auth/AuthPanel";
import { supabase } from "../../utils/supabase";

type Report = {
  id: string; user_id: string; title: string; description: string; category: string;
  location_text: string; latitude: number | null; longitude: number | null; location_accuracy_m: number | null; location_captured_at: string | null; photo_path: string | null;
  assigned_department: string | null; admin_remarks: string | null;
  status: "submitted" | "in_review" | "resolved" | "rejected";
  created_at: string; updated_at: string;
};
const categoryLabels: Record<string, string> = {
  roads: "Roads & footpaths", waste: "Waste & cleanliness", lighting: "Street lighting",
  water: "Water & drainage", parks: "Parks & public spaces", other: "Other local concern",
};
type HistoryEntry = { id: string; old_status: string | null; new_status: Report["status"]; assigned_department: string | null; admin_remarks: string | null; created_at: string };
const statusLabels: Record<Report["status"], string> = {
  submitted: "Submitted", in_review: "In review", resolved: "Resolved", rejected: "Closed",
};

export function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<Report["status"]>("submitted");
  const [editDepartment, setEditDepartment] = useState("");
  const [editRemarks, setEditRemarks] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [saving, setSaving] = useState(false);

  const checkAccess = useCallback(async (activeSession: Session | null) => {
    setSession(activeSession);
    setRole(null);
    setReports([]);
    if (!supabase || !activeSession) { setCheckingAccess(false); return; }
    setCheckingAccess(true);
    const { data, error: profileError } = await supabase.from("profiles").select("role").eq("id", activeSession.user.id).maybeSingle();
    if (profileError) setError(profileError.message);
    setRole(data?.role ?? null);
    setCheckingAccess(false);
  }, []);

  const loadReports = useCallback(async () => {
    if (!supabase || role !== "admin") return;
    setLoading(true); setError("");
    const { data, error: loadError } = await supabase.from("reports")
      .select("id,user_id,title,description,category,location_text,latitude,longitude,location_accuracy_m,location_captured_at,photo_path,status,assigned_department,admin_remarks,created_at,updated_at")
      .order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setReports((data ?? []) as Report[]);
    setLoading(false);
  }, [role]);

  useEffect(() => {
    if (!supabase) { setCheckingAccess(false); return; }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => { if (active) void checkAccess(data.session); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => { if (active) void checkAccess(nextSession); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [checkAccess]);
  useEffect(() => { if (role === "admin") void loadReports(); }, [role, loadReports]);

  const visibleReports = useMemo(() => {
    const term = query.trim().toLowerCase();
    return reports.filter(report =>
      (status === "all" || report.status === status) &&
      (category === "all" || report.category === category) &&
      (!term || [report.title, report.description, report.location_text, report.id, report.user_id].some(value => value.toLowerCase().includes(term)))
    );
  }, [reports, query, status, category]);
  const selected = visibleReports.find(report => report.id === selectedId) ?? null;
  useEffect(() => {
    if (!selected) { setHistory([]); return; }
    setEditStatus(selected.status);
    setEditDepartment(selected.assigned_department ?? "");
    setEditRemarks(selected.admin_remarks ?? "");
    if (!supabase) return;
    let active = true;
    void supabase.from("report_status_history")
      .select("id,old_status,new_status,assigned_department,admin_remarks,created_at")
      .eq("report_id", selected.id).order("created_at", { ascending: false })
      .then(({ data, error: historyError }) => {
        if (!active) return;
        if (historyError) setError(historyError.message);
        else setHistory((data ?? []) as HistoryEntry[]);
      });
    return () => { active = false; };
  }, [selected?.id]);

  const saveReportManagement = async () => {
    if (!supabase || !selected) return;
    setSaving(true); setError("");
    const { error: saveError } = await supabase.rpc("admin_update_civicfix_report", {
      p_report_id: selected.id,
      p_status: editStatus,
      p_department: editDepartment,
      p_admin_remarks: editRemarks,
    });
    if (saveError) setError(saveError.message);
    else {
      await loadReports();
      const { data: historyData, error: historyError } = await supabase
        .from("report_status_history")
        .select("id,old_status,new_status,assigned_department,admin_remarks,created_at")
        .eq("report_id", selected.id).order("created_at", { ascending: false });
      if (historyError) setError(historyError.message);
      else setHistory((historyData ?? []) as HistoryEntry[]);
    }
    setSaving(false);
  };

  const counts = useMemo(() => ({
    total: reports.length,
    submitted: reports.filter(report => report.status === "submitted").length,
    inReview: reports.filter(report => report.status === "in_review").length,
    resolved: reports.filter(report => report.status === "resolved").length,
  }), [reports]);

  const openPhoto = async (path: string) => {
    if (!supabase) return;
    const { data, error: photoError } = await supabase.storage.from("report-photos").createSignedUrl(path, 60);
    if (photoError) setError(photoError.message);
    else if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="admin-page">
      <header className="site-header"><nav className="nav-wrap" aria-label="Admin navigation">
        <a className="brand" href="/"><span className="brand-icon"><MapPin size={19} /></span><span>CivicFix</span><span className="admin-brand-tag">ADMIN</span></a>
        <div className="admin-nav-actions"><a className="report-back-link" href="/"><ArrowLeft size={15} /> Home</a><AuthPanel /></div>
      </nav></header>
      <section className="admin-intro"><div className="page-width"><span className="section-label">CIVICFIX / ADMINISTRATION</span><h1>Report <span>overview.</span></h1><p>Review submitted neighbourhood concerns and find the details you need to assess each report.</p></div></section>
      <section className="admin-content page-width">
        {!supabase ? <div className="admin-message"><AlertCircle /><div><strong>Supabase is not configured</strong><p>Add the Supabase environment variables to enable the admin dashboard.</p></div></div>
        : checkingAccess ? <div className="admin-message"><RefreshCw className="admin-spin" /><div><strong>Checking access…</strong><p>Verifying your CivicFix account permissions.</p></div></div>
        : !session ? <div className="admin-message"><LogIn /><div><strong>Sign in to continue</strong><p>Use your authorized CivicFix administrator account to access this dashboard.</p></div><AuthPanel /></div>
        : role !== "admin" ? <div className="admin-message"><ShieldCheck /><div><strong>Administrator access required</strong><p>This account does not have the admin role. Ask the project owner to grant access in Supabase.</p></div></div>
        : <>
          <div className="admin-toolbar"><div><span className="section-label">REPORT MANAGEMENT / PHASE 2</span><h2>All citizen reports</h2></div><button type="button" className="admin-refresh" onClick={() => void loadReports()} disabled={loading}><RefreshCw size={15} className={loading ? "admin-spin" : ""} /> Refresh</button></div>
          <div className="admin-stats">
            <article><span>Total reports</span><strong>{counts.total}</strong><small>All submissions</small></article>
            <article><span>Submitted</span><strong>{counts.submitted}</strong><small>Awaiting review</small></article>
            <article><span>In review</span><strong>{counts.inReview}</strong><small>Being assessed</small></article>
            <article><span>Resolved</span><strong>{counts.resolved}</strong><small>Marked complete</small></article>
          </div>
          <div className="admin-filters">
            <label className="admin-search"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search title, location or report ID…" /></label>
            <label><Filter size={15} /><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option><option value="submitted">Submitted</option><option value="in_review">In review</option><option value="resolved">Resolved</option><option value="rejected">Closed</option></select></label>
            <label><select value={category} onChange={event => setCategory(event.target.value)}><option value="all">All categories</option>{Object.entries(categoryLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          </div>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <div className="admin-workspace">
            <div className="admin-report-list"><div className="admin-list-heading"><strong>{visibleReports.length} reports</strong><span>Newest first</span></div>
              {loading ? <p className="admin-empty">Loading reports…</p> : visibleReports.length === 0 ? <p className="admin-empty">No reports match these filters.</p> : visibleReports.map(report =>
                <button type="button" key={report.id} className={selectedId === report.id ? "admin-report-row selected" : "admin-report-row"} onClick={() => setSelectedId(report.id)}>
                  <span className="admin-row-top"><span>{categoryLabels[report.category] ?? report.category}</span><span className={"report-status status-" + report.status}>{statusLabels[report.status]}</span></span>
                  <strong>{report.title}</strong><small><MapPin size={12} /> {report.location_text}</small><small>{new Date(report.created_at).toLocaleString()}</small>
                </button>
              )}
            </div>
            <aside className="admin-detail">{selected ? <>
              <div className="admin-detail-top"><span className="section-label">REPORT DETAILS</span><span className={"report-status status-" + selected.status}>{statusLabels[selected.status]}</span></div>
              <h3>{selected.title}</h3><p className="admin-detail-category">{categoryLabels[selected.category] ?? selected.category}</p>
              <div className="admin-detail-field"><span>LOCATION</span><p>{selected.location_text}</p></div>
              <div className="admin-detail-field"><span>GPS EVIDENCE</span><p>{selected.latitude !== null && selected.longitude !== null ? `${selected.latitude.toFixed(6)}, ${selected.longitude.toFixed(6)} · ±${Math.round(selected.location_accuracy_m ?? 0)} m accuracy` : "No GPS location captured"}</p>{selected.latitude !== null && selected.longitude !== null && <a className="admin-map-link" href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`} target="_blank" rel="noreferrer">Open captured coordinates in map <ExternalLink size={12} /></a>}{selected.location_captured_at && <small>{new Date(selected.location_captured_at).toLocaleString()}</small>}</div>
              <div className="admin-detail-field"><span>DESCRIPTION</span><p>{selected.description}</p></div>
              <div className="admin-detail-field"><span>SUBMITTED</span><p>{new Date(selected.created_at).toLocaleString()}</p></div>
              <div className="admin-detail-field"><span>REPORT ID</span><p className="admin-id">{selected.id}</p></div>
              <div className="admin-detail-field"><span>CITIZEN USER ID</span><p className="admin-id">{selected.user_id}</p></div>
              {selected.photo_path && <button className="admin-photo-button" type="button" onClick={() => void openPhoto(selected.photo_path!)}><FileImage size={16} /> View attached photo <ExternalLink size={13} /></button>}
              <div className="admin-management-panel">
                <span className="section-label">ADMIN ACTIONS</span>
                <label>Report status
                  <select value={editStatus} onChange={event => setEditStatus(event.target.value as Report["status"])}>
                    <option value="submitted">Submitted</option><option value="in_review">In review</option><option value="resolved">Resolved</option><option value="rejected">Rejected / closed</option>
                  </select>
                </label>
                <label>Assigned department
                  <select value={editDepartment} onChange={event => setEditDepartment(event.target.value)}>
                    <option value="">Not assigned</option><option value="Roads & Public Works">Roads & Public Works</option><option value="Sanitation">Sanitation</option><option value="Street Lighting">Street Lighting</option><option value="Water & Drainage">Water & Drainage</option><option value="Parks & Horticulture">Parks & Horticulture</option><option value="Other Civic Services">Other Civic Services</option>
                  </select>
                </label>
                <label>Update / remarks for citizen
                  <textarea value={editRemarks} onChange={event => setEditRemarks(event.target.value)} maxLength={1200} rows={4} placeholder="Add a useful progress update or explanation…" />
                </label>
                <button className="admin-save-button" type="button" onClick={() => void saveReportManagement()} disabled={saving}>
                  <Save size={15} /> {saving ? "Saving…" : "Save report update"}
                </button>
              </div>
              <div className="admin-history">
                <span className="section-label"><History size={13} /> UPDATE HISTORY</span>
                {history.length === 0 ? <p>No administrative updates yet.</p> : history.map(item => <article key={item.id}>
                  <strong>{statusLabels[item.new_status] ?? item.new_status}</strong>
                  <small>{new Date(item.created_at).toLocaleString()}</small>
                  {item.assigned_department && <p>Department: {item.assigned_department}</p>}
                  {item.admin_remarks && <p>{item.admin_remarks}</p>}
                </article>)}
              </div>

            </> : <div className="admin-empty admin-detail-empty"><ClipboardList size={28} /><strong>Select a report</strong><p>Choose a report from the list to inspect its details.</p></div>}</aside>
          </div>
        </>}
      </section>
      <footer className="site-footer"><div className="page-width footer-inner"><a className="brand footer-brand" href="/"><span className="brand-icon"><MapPin size={19} /></span><span>CivicFix</span></a><p>Authorized administration only.</p><span className="copyright">CIVICFIX / ADMIN</span></div></footer>
    </main>
  );
}
