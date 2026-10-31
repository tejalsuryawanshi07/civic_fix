import { useState } from "react";
import { AuthPanel } from "./features/auth/AuthPanel";
import { ReportPage } from "./features/reports/ReportPage";
import { AdminPage } from "./features/admin/AdminPage";
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown, Construction, Droplets,
  Lightbulb, MapPin, Menu, ShieldCheck, Trash2, Trees, X,
} from "lucide-react";

const issueTypes = [
  { icon: Construction, title: "Roads & footpaths", detail: "Potholes, damaged pavements, broken kerbs and unsafe crossings." },
  { icon: Trash2, title: "Waste & cleanliness", detail: "Missed collections, overflowing bins and illegal dumping." },
  { icon: Lightbulb, title: "Street lighting", detail: "Broken, missing or unreliable streetlights." },
  { icon: Droplets, title: "Water & drainage", detail: "Leaking pipes, blocked drains and waterlogging." },
  { icon: Trees, title: "Parks & public spaces", detail: "Damaged equipment and neglected shared green spaces." },
  { icon: MapPin, title: "Other local concerns", detail: "Other issues affecting neighbourhood spaces and public services." },
];

const steps = [
  { n: "01", title: "Pin the problem", text: "Identify where the issue is and describe what you noticed. A clear location makes a concern easier to understand." },
  { n: "02", title: "Add useful context", text: "Share a concise description and, where safe and appropriate, a photo that helps explain the issue." },
  { n: "03", title: "Follow the next step", text: "Submit a concern and return to your account to review the reports you have sent. Administrative updates will be added in a later phase." },
];

const faqs = [
  { q: "What kind of issues can CivicFix help highlight?", a: "CivicFix is designed around shared neighbourhood concerns such as damaged roads, waste collection, street lighting, drainage, water leaks and public-space maintenance." },
  { q: "What should I include in a report?", a: "Include a clear description and a specific location. If it is safe and appropriate, a recent photo can help explain the issue. Avoid sharing personal or identifying information." },
  { q: "Can I submit and track a report right now?", a: "Once the reports database migration is applied and Supabase is configured, signed-in citizens can submit a report and view their own submissions. Administrative review and live status updates are still in development." },
  { q: "Does CivicFix carry out repairs?", a: "No. CivicFix is intended to help residents raise awareness of local concerns. Repairs and official decisions remain the responsibility of the relevant civic authority." },
];

function NeighbourhoodMap() {
  return (
    <div className="map-shell" role="img" aria-label="Concept illustration of a neighbourhood map with sample issue markers">
      <div className="map-meta"><span>NEIGHBOURHOOD OVERVIEW</span><span>CONCEPT VIEW · NOT LIVE DATA</span></div>
      <div className="map-canvas">
        <span className="map-park park-a" /><span className="map-park park-b" />
        <span className="map-block map-block-a" /><span className="map-block map-block-b" />
        <span className="map-block map-block-c" /><span className="map-block map-block-d" />
        <span className="map-road map-road-a" /><span className="map-road map-road-b" />
        <span className="map-road map-road-c" /><span className="map-road map-road-d" />
        <span className="map-marker marker-a"><i /></span>
        <span className="map-marker marker-b"><i /></span>
        <div className="map-issue-card issue-a"><span className="map-issue-icon"><Lightbulb size={15} /></span><span><b>Streetlight issue</b><small>Illustrative marker</small><em>EXAMPLE</em></span></div>
        <div className="map-issue-card issue-b"><span className="map-issue-icon"><Construction size={15} /></span><span><b>Road concern</b><small>Illustrative marker</small><em>EXAMPLE</em></span></div>
        <span className="map-compass">N <ArrowUpRight size={14} /></span>
        <span className="map-scale">LOCAL VIEW / 01</span>
      </div>
      <div className="map-legend"><span><i className="legend-dot" /> Example issue marker</span><span>NOTICE · REPORT · FOLLOW</span></div>
    </div>
  );
}

function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const navItems = [["Report an issue", "/report"], ["How it works", "#how-it-works"], ["Categories", "#categories"], ["Our mission", "#mission"], ["FAQ", "#faq"]];

  return (
    <main>
      <header className="site-header">
        <nav className="nav-wrap" aria-label="Main navigation">
          <a className="brand" href="#home" onClick={closeMenu}><span className="brand-icon"><MapPin size={19} /></span><span>CivicFix</span></a>
          <div className="desktop-nav">{navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</div>
          <div className="nav-actions"><AuthPanel /><a className="nav-cta" href="#how-it-works">Explore CivicFix <ArrowUpRight size={15} /></a></div>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </nav>
        {menuOpen && <div className="mobile-nav">{navItems.map(([label, href]) => <a key={href} href={href} onClick={closeMenu}>{label}<ArrowUpRight size={15} /></a>)}</div>}
      </header>

      <section className="hero-section" id="home">
        <div className="hero-grid-bg" />
        <div className="page-width hero-layout">
          <div className="hero-copy">
            <div className="eyebrow"><span /> A COMMUNITY-LED WAY TO RAISE LOCAL ISSUES</div>
            <p className="hero-kicker">CIVICFIX <span> / </span> THE NEIGHBOURHOOD, NOTICED</p>
            <h1>The pulse of <span>your street,</span> restored.</h1>
            <p className="hero-description">CivicFix aims to make local civic concerns easier to notice, understand and follow — bringing neighbourhood issues into clearer view.</p>
            <div className="hero-actions"><a className="button button-primary" href="/report">Report an issue <ArrowRight size={17} /></a><a className="button button-secondary" href="#how-it-works">See how it works</a></div>
            <div className="hero-footnote"><ShieldCheck size={17} /><span>A clearer first step towards better shared spaces.</span></div>
          </div>
          <NeighbourhoodMap />
        </div>
        <div className="page-width hero-bottomline"><span>YOUR CITY. YOUR VOICE. YOUR FIX.</span><a href="#mission">DISCOVER THE MISSION <ArrowRight size={14} /></a></div>
      </section>

      <section className="mission-section section-pad" id="mission">
        <div className="page-width mission-layout">
          <div className="mission-visual">
            <div className="mission-map-card"><div className="mini-map-grid"><span /><span /><span /></div><div className="mission-map-caption"><MapPin size={17} /><span>LOCAL ISSUES, MADE VISIBLE</span></div></div>
            <div className="mission-note"><span>THE IDEA</span><p>Better neighbourhoods begin when people can make local problems visible.</p></div>
          </div>
          <div className="mission-copy"><div className="section-label">01 / WHY CIVICFIX</div><h2>Mapping a better <span>future for every block.</span></h2><p>Urban issues can be easy to overlook and difficult to communicate. CivicFix is designed around a simple idea: give residents a clearer way to describe what needs attention and where it is happening.</p><p>When local concerns are easier to understand, communities have a stronger starting point for constructive action.</p><ul><li><Check size={17} /> Neighbourhood-first visibility</li><li><Check size={17} /> Clear, useful issue descriptions</li><li><Check size={17} /> A focus on shared public spaces</li></ul></div>
        </div>
      </section>

      <section className="categories-section section-pad" id="categories"><div className="page-width">
        <div className="section-heading"><div><div className="section-label">02 / WHAT CAN BE REPORTED</div><h2>Everyday issues.<br /><span>One shared place.</span></h2></div><p>From roads to public spaces, explore the kinds of neighbourhood concerns CivicFix is designed to bring into focus.</p></div>
        <div className="category-grid">{issueTypes.map((item, index) => { const Icon = item.icon; return <article className="category-card" key={item.title}><div className="category-card-top"><span>0{index + 1}</span><span className="category-icon"><Icon size={21} strokeWidth={1.7} /></span></div><h3>{item.title}</h3><p>{item.detail}</p><span className="card-arrow"><ArrowUpRight size={17} /></span></article>; })}</div>
      </div></section>

      <section className="workflow-section section-pad" id="how-it-works"><div className="page-width">
        <div className="section-heading workflow-heading"><div><div className="section-label">03 / THE PROCESS</div><h2>From noticing<br />to <span>next steps.</span></h2></div><p>A simple, human approach to raising awareness of local issues. These are the intended steps for the CivicFix experience.</p></div>
        <div className="workflow-grid">{steps.map(step => <article className="workflow-card" key={step.n}><span className="workflow-number">{step.n}</span><div className="workflow-line" /><h3>{step.title}</h3><p>{step.text}</p><ArrowUpRight className="workflow-arrow" size={19} /></article>)}</div>
        <div className="safety-note"><ShieldCheck size={20} /><p><strong>Stay safe while documenting an issue.</strong> Never enter unsafe areas, trespass or include private identifying information in a public report.</p></div>
      </div></section>

      <section className="principles-section section-pad"><div className="page-width"><div className="section-label">04 / OUR PRINCIPLES</div><div className="principles-grid"><article><span>01 — CLARITY</span><h3>Make the problem understandable.</h3><p>Specific locations and useful details help explain what needs attention.</p></article><article><span>02 — TRANSPARENCY</span><h3>Make the next step easier to follow.</h3><p>People should have a clearer picture of how a concern is progressing.</p></article><article><span>03 — COMMUNITY</span><h3>Care for the places we share.</h3><p>Residents can help bring attention to the streets and spaces everyone uses.</p></article></div></div></section>

      <section className="faq-section section-pad" id="faq"><div className="page-width faq-layout"><div><div className="section-label">05 / SUPPORT</div><h2>Good questions.<br /><span>Clear answers.</span></h2><p>What to know about CivicFix and this website preview.</p></div><div className="faq-list">{faqs.map((faq, index) => <article className={openFaq === index ? "faq-item is-open" : "faq-item"} key={faq.q}><button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{faq.q}</span><ChevronDown size={19} /></button>{openFaq === index && <p>{faq.a}</p>}</article>)}</div></div></section>

      <section className="closing-section"><div className="page-width closing-panel"><div className="closing-grid" /><div className="section-label">YOUR NEIGHBOURHOOD, IN FOCUS</div><h2>Better places<br />start with <span>noticing.</span></h2><p>Explore the CivicFix approach to making local concerns easier to see and understand.</p><a className="button button-light" href="/report">Submit a local report <ArrowRight size={17} /></a><small>WEBSITE PREVIEW · REPORTING FEATURES IN DEVELOPMENT</small></div></section>

      <footer className="site-footer"><div className="page-width footer-inner"><a className="brand footer-brand" href="#home"><span className="brand-icon"><MapPin size={19} /></span><span>CivicFix</span></a><p>Designed around better neighbourhoods.</p><div className="footer-links"><a href="#mission">Our mission</a><a href="/report">Report an issue</a><a href="#categories">Issue types</a><a href="#faq">Support</a></div><span className="copyright">© {new Date().getFullYear()} CIVICFIX</span></div></footer>
    </main>
  );
}

 
export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return path === "/report" ? <ReportPage /> : <HomePage />;
}
