import { ArrowLeft, MapPin } from "lucide-react";
import { AuthPanel } from "../auth/AuthPanel";
import { ReportCenter } from "./ReportCenter";

export function ReportPage() {
  return (
    <main className="report-page">
      <header className="site-header">
        <nav className="nav-wrap" aria-label="Report page navigation">
          <a className="brand" href="/"><span className="brand-icon"><MapPin size={19} /></span><span>CivicFix</span></a>
          <div className="report-page-nav">
            <a className="report-back-link" href="/"><ArrowLeft size={15} /> Back to home</a>
            <AuthPanel />
          </div>
        </nav>
      </header>
      <div className="report-page-intro">
        <div className="page-width">
          <span className="section-label">CITIZEN REPORTING / CIVICFIX</span>
          <h1>Raise a local concern.<br /><span>Make it easier to act.</span></h1>
          <p>Share what is happening in your neighbourhood and review the reports you have submitted from one place.</p>
        </div>
      </div>
      <ReportCenter />
      <footer className="site-footer">
        <div className="page-width footer-inner">
          <a className="brand footer-brand" href="/"><span className="brand-icon"><MapPin size={19} /></span><span>CivicFix</span></a>
          <p>Designed around better neighbourhoods.</p>
          <div className="footer-links"><a href="/">Home</a><a href="/#mission">Our mission</a><a href="/#faq">Support</a></div>
          <span className="copyright">© {new Date().getFullYear()} CIVICFIX</span>
        </div>
      </footer>
    </main>
  );
}
