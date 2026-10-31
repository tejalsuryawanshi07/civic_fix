import { useState } from "react";
import {
  ArrowDown, ArrowRight, ArrowUpRight, ChevronDown, Construction,
  Droplets, Lightbulb, MapPin, Menu, ShieldCheck, Trash2, Trees, X,
} from "lucide-react";

const issueTypes = [
  { icon: Construction, title: "Roads & footpaths", detail: "Potholes, damaged pavements, broken kerbs and unsafe crossings." },
  { icon: Trash2, title: "Waste & cleanliness", detail: "Missed waste collection, overflowing bins and illegal dumping." },
  { icon: Lightbulb, title: "Street lighting", detail: "Streetlights that are broken, missing or not working after dark." },
  { icon: Droplets, title: "Water & drainage", detail: "Leaking pipes, blocked drains, waterlogging and flooding." },
  { icon: Trees, title: "Parks & public spaces", detail: "Damaged park equipment, neglected green spaces and public-area repairs." },
  { icon: MapPin, title: "Other local concerns", detail: "A neighbourhood issue that affects shared spaces or public services." },
];

const steps = [
  { number: "01", title: "Spot something", detail: "Notice an issue in a street, park or shared public space. If it is safe, take a photo and note where it is." },
  { number: "02", title: "Make it clear", detail: "A useful report explains what happened and where. A precise location helps the right people understand the problem." },
  { number: "03", title: "Follow what happens", detail: "CivicFix is designed to make progress easier to understand, so residents can see updates instead of wondering what happened." },
];

const faqs = [
  { question: "What kind of issues belong on CivicFix?", answer: "Issues affecting shared neighbourhood spaces and civic services: damaged roads, overflowing bins, broken streetlights, drainage problems, water leaks and public-space maintenance." },
  { question: "What makes a useful report?", answer: "A clear description, a specific location and—when it is safe and appropriate—a recent photo. Avoid sharing personal information or photographing people unnecessarily." },
  { question: "Does CivicFix itself repair the issue?", answer: "No. CivicFix is intended to help residents communicate local problems and follow their progress. Repairs and official decisions remain the responsibility of the relevant civic authority." },
  { question: "Can I submit and track a live report right now?", answer: "This version is the CivicFix website preview. Online report submission and live status tracking are not connected yet; those workflows will be added as the platform is developed." },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <nav className="nav wrap" aria-label="Main navigation">
        <a className="brand" href="#home" aria-label="CivicFix home" onClick={closeMenu}><span className="brand-mark">C</span> CIVICFIX</a>
        <div className="nav-links">
          <a href="#issues">ISSUES</a><a href="#how-it-works">HOW IT WORKS</a><a href="#about">ABOUT</a><a href="#faq">FAQ</a>
        </div>
        <a className="nav-cta" href="#how-it-works">EXPLORE THE PROCESS <ArrowRight size={15} /></a>
        <button className="menu-button" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </nav>
      {menuOpen && <div className="mobile-menu">
        <a href="#issues" onClick={closeMenu}>ISSUES <ArrowUpRight size={16} /></a>
        <a href="#how-it-works" onClick={closeMenu}>HOW IT WORKS <ArrowUpRight size={16} /></a>
        <a href="#about" onClick={closeMenu}>ABOUT <ArrowUpRight size={16} /></a>
        <a href="#faq" onClick={closeMenu}>FAQ <ArrowUpRight size={16} /></a>
      </div>}

      <section className="hero wrap" id="home">
        <div className="eyebrow"><span className="eyebrow-dot" /> A COMMUNITY-LED WAY TO RAISE LOCAL ISSUES</div>
        <div className="hero-grid">
          <div className="hero-main">
            <p className="hero-kicker">CIVICFIX <span>—</span> THE NEIGHBOURHOOD, NOTICED</p>
            <h1>Your neighbourhood,<br /><em>in focus.</em></h1>
            <p className="hero-subline">The little things that make a place home deserve to be seen.</p>
            <div className="hero-mantra"><span>YOUR CITY.</span><span>YOUR VOICE.</span><strong>YOUR FIX.</strong></div>
            <a className="button button-blue hero-action" href="#how-it-works">SEE HOW IT WORKS <ArrowRight size={17} /></a>
          </div>
          <div className="hero-art" aria-label="Illustration of a neighbourhood map with a highlighted local issue">
            <div className="map-topline"><span>THE LOCAL VIEW</span><span>01 / 03</span></div>
            <div className="map-grid">
              <span className="map-road road-one" /><span className="map-road road-two" /><span className="map-road road-three" />
              <span className="map-block block-one" /><span className="map-block block-two" /><span className="map-block block-three" /><span className="map-block block-four" />
              <span className="map-park">GREEN<br />SPACE</span>
              <span className="map-pin"><MapPin size={25} fill="currentColor" /></span>
              <span className="map-callout"><b>ISSUE SPOTTED</b><small>One report can start a conversation.</small></span>
              <span className="map-coordinate">21° 14' N&nbsp; / &nbsp;81° 38' E</span>
            </div>
            <div className="map-bottomline"><span><i /> A CLOSER LOOK AT YOUR STREETS</span><span>NOTICE · REPORT · FOLLOW</span></div>
          </div>
        </div>
        <div className="hero-bottom"><span>BETTER NEIGHBOURHOODS BEGIN WITH PAYING ATTENTION.</span><a href="#issues" aria-label="Scroll to issue categories"><ArrowDown /></a></div>
      </section>

      <section className="intro wrap" id="about">
        <div className="section-label">/ WHY CIVICFIX</div>
        <div className="intro-content">
          <h2>SMALL ISSUES.<br />SHARED <span>IMPACT.</span></h2>
          <div><p>Good neighbourhoods depend on everyday things working well. But when a public problem goes unnoticed or residents do not know where to raise it, it can remain unresolved.</p><p>CivicFix aims to make that first step simpler: describe the issue, identify its location and make it easier to follow the response.</p></div>
        </div>
      </section>

      <section className="issues-section" id="issues"><div className="wrap">
        <div className="section-topline"><div><div className="section-label">/ WHAT CAN BE REPORTED</div><h2>EVERYDAY PROBLEMS.<br /><span>VISIBLE TO ALL.</span></h2></div><p className="section-summary">Civic concerns often start small. These are examples of the local issues CivicFix is designed to help bring forward.</p></div>
        <div className="issue-grid">{issueTypes.map((item, index) => { const Icon = item.icon; return <article className="issue-card" key={item.title}><div className="issue-card-top"><span>0{index + 1}</span><Icon size={22} strokeWidth={1.5} /></div><h3>{item.title}</h3><p>{item.detail}</p><span className="issue-rule" /></article>; })}</div>
      </div></section>

      <section className="steps-section" id="how-it-works"><div className="wrap">
        <div className="section-heading"><div className="section-label">/ HOW IT WORKS</div><div><h2>FROM NOTICE<br />TO <span>NEXT STEP.</span></h2><p className="section-summary">A straightforward path from seeing a problem to understanding its status.</p></div></div>
        <div className="steps-grid">{steps.map(step => <article className="step" key={step.number}><span className="step-number">{step.number}</span><h3>{step.title}</h3><p>{step.detail}</p><ArrowDown className="step-arrow" size={21} /></article>)}</div>
        <div className="process-note"><ShieldCheck size={18} /><p><strong>Be safe and considerate.</strong> Never put yourself at risk to document an issue. Do not trespass or include private, identifying information in a public report.</p></div>
      </div></section>

      <section className="principles wrap"><div className="section-label">/ WHAT CIVICFIX STANDS FOR</div><div className="principle-list">
        <article><span>01 / CLARITY</span><h3>Make the problem easy to understand.</h3><p>Useful details and a clear location help turn a vague concern into something actionable.</p></article>
        <article><span>02 / VISIBILITY</span><h3>Make progress easier to follow.</h3><p>Residents should not be left guessing about whether a concern has been seen or what happens next.</p></article>
        <article><span>03 / COMMUNITY</span><h3>Better public spaces are shared work.</h3><p>People who notice local problems can help bring attention to the places everyone uses.</p></article>
      </div></section>

      <section className="faq-section" id="faq"><div className="wrap faq-layout">
        <div><div className="section-label">/ GOOD TO KNOW</div><h2>QUESTIONS,<br /><span>ANSWERED.</span></h2><p className="faq-intro">A little more about the purpose and current scope of CivicFix.</p></div>
        <div className="faq-list">{faqs.map(faq => <details className="faq-item" key={faq.question}><summary>{faq.question}<ChevronDown size={18} /></summary><p>{faq.answer}</p></details>)}</div>
      </div></section>

      <section className="closing wrap" id="get-started"><div className="section-label">/ YOUR CITY IS WORTH IT</div><div className="closing-row">
        <h2>NOTICE MORE.<br />CARE <span>TOGETHER.</span></h2>
        <div className="closing-aside"><p>Change can start with one person paying attention. Learn how CivicFix is designed to help make local concerns visible.</p><a className="button button-dark" href="#how-it-works">EXPLORE THE PROCESS <ArrowRight size={17} /></a><small>A CIVIC PLATFORM IN DEVELOPMENT.</small></div>
      </div></section>

      <footer className="footer wrap"><a className="brand" href="#home"><span className="brand-mark">C</span> CIVICFIX</a><span>MADE FOR BETTER COMMUNITIES.</span><a href="#faq">ABOUT THIS PREVIEW <ArrowUpRight size={13} /></a><span>© {new Date().getFullYear()} CIVICFIX</span></footer>
    </main>
  );
}

export default App;