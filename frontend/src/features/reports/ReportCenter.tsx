import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { AlertCircle, CheckCircle2, Clock3, ImagePlus, MapPin, Send, ShieldCheck } from "lucide-react";
import { supabase } from "../../utils/supabase";

type Report = {
  id: string;
  title: string;
  description: string;
  category: string;
  location_text: string;
  photo_path: string | null;
  status: "submitted" | "in_review" | "resolved" | "rejected";
  created_at: string;
};

const categories = [
  ["roads", "Roads & footpaths"], ["waste", "Waste & cleanliness"],
  ["lighting", "Street lighting"], ["water", "Water & drainage"],
  ["parks", "Parks & public spaces"], ["other", "Other local concern"],
];

const statusLabels: Record<Report["status"], string> = {
  submitted: "Submitted", in_review: "In review", resolved: "Resolved", rejected: "Closed",
};

export function ReportCenter() {
  const [session, setSession] = useState<Session | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("roads");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadReports = useCallback(async (userId: string) => {
    if (!supabase) return;
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from("reports")
      .select("id,title,description,category,location_text,photo_path,status,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (queryError) setError(queryError.message);
    else setReports((data ?? []) as Report[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) void loadReports(data.session.user.id);
      else setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      setReports([]);
      if (next) void loadReports(next.user.id);
      else setLoading(false);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadReports]);

  const submitReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !session) return;
    setSubmitting(true);
    setError("");
    setNotice("");
    let photoPath: string | null = null;
    try {
      if (photo) {
        const extension = photo.name.split(".").pop()?.toLowerCase() || "jpg";
        photoPath = `${session.user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("report-photos").upload(photoPath, photo, { contentType: photo.type, upsert: false });
        if (uploadError) throw uploadError;
      }
      const { error: insertError } = await supabase.from("reports").insert({
        user_id: session.user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        location_text: location.trim(),
        photo_path: photoPath,
      });
      if (insertError) {
        if (photoPath) await supabase.storage.from("report-photos").remove([photoPath]);
        throw insertError;
      }
      setTitle(""); setDescription(""); setCategory("roads"); setLocation(""); setPhoto(null);
      const fileInput = document.getElementById("report-photo") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      setNotice("Your report has been submitted.");
      await loadReports(session.user.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't submit your report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const photoUrl = async (path: string | null) => {
    if (!supabase || !path) return;
    const { data } = await supabase.storage.from("report-photos").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="report-section section-pad" id="report">
      <div className="page-width">
        <div className="section-heading report-heading">
          <div><div className="section-label">02 / CITIZEN REPORTING</div><h2>Make your local<br /><span>concern visible.</span></h2></div>
          <p>Signed-in citizens can submit a neighbourhood issue and return here to review the reports linked to their account.</p>
        </div>
        {!supabase ? (
          <div className="report-gate"><AlertCircle size={20} /><p>Reporting is not configured yet. Add the Supabase environment variables to enable this section.</p></div>
        ) : !session ? (
          <div className="report-gate"><ShieldCheck size={22} /><div><strong>Sign in to submit a report</strong><p>Your reports are private to your account. Use the Sign in option in the header to continue.</p></div></div>
        ) : (
          <div className="report-layout">
            <form className="report-form" onSubmit={submitReport}>
              <div className="report-form-heading"><span>NEW REPORT</span><small><i /> Signed in as {session.user.user_metadata?.full_name || session.user.email}</small></div>
              <label>Issue title<input value={title} onChange={e => setTitle(e.target.value)} minLength={5} maxLength={120} required placeholder="e.g. Large pothole near the bus stop" /></label>
              <label>Issue category<select value={category} onChange={e => setCategory(e.target.value)}>{categories.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label>Location<input value={location} onChange={e => setLocation(e.target.value)} minLength={3} maxLength={300} required placeholder="Street, landmark or neighbourhood" /></label>
              <label>Description<textarea value={description} onChange={e => setDescription(e.target.value)} minLength={10} maxLength={3000} rows={5} required placeholder="Describe what happened and any useful details…" /></label>
              <label className="report-photo-label" htmlFor="report-photo"><ImagePlus size={17} /><span>{photo ? photo.name : "Add a photo (optional)"}</span><input id="report-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setPhoto(e.target.files?.[0] ?? null)} /></label>
              <small className="report-hint">JPEG, PNG or WebP · Up to 5 MB. Avoid faces, number plates and personal information.</small>
              <button className="button button-primary report-submit" type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit report"} <Send size={15} /></button>
              {error && <p className="report-feedback error" role="alert">{error}</p>}
              {notice && <p className="report-feedback success" role="status">{notice}</p>}
            </form>
            <div className="my-reports">
              <div className="my-reports-heading"><div><span className="section-label">YOUR ACTIVITY</span><h3>My reports</h3></div><span className="report-count">{reports.length} total</span></div>
              {loading ? <p className="reports-empty">Loading your reports…</p> : reports.length === 0 ? (
                <div className="reports-empty"><MapPin size={23} /><strong>No reports yet</strong><p>Your submitted concerns will appear here.</p></div>
              ) : <div className="report-list">{reports.map(report => <article className="report-item" key={report.id}>
                <div className="report-item-top"><span>{categories.find(([value]) => value === report.category)?.[1] ?? "Local concern"}</span><span className={`report-status status-${report.status}`}>{report.status === "resolved" ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}{statusLabels[report.status]}</span></div>
                <h4>{report.title}</h4><p>{report.location_text}</p><small>{new Date(report.created_at).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}</small>
                {report.photo_path && <button type="button" className="report-photo-link" onClick={() => void photoUrl(report.photo_path)}>View attached photo</button>}
              </article>)}</div>}
            </div>
          </div>
        )}
        <div className="report-safety"><ShieldCheck size={17} /><span>For emergencies or immediate danger, contact the appropriate emergency service. CivicFix is not an emergency-response service.</span></div>
      </div>
    </section>
  );
}
