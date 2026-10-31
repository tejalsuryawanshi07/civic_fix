import { ArrowDownRight, ArrowRight, MapPin, Menu } from "lucide-react";

const steps = [
  { number: "01", title: "Spot an issue", detail: "Notice a problem in your neighbourhood that needs attention." },
  { number: "02", title: "Report it", detail: "Share the location and a short description so it can be reviewed." },
  { number: "03", title: "Follow progress", detail: "Keep track of the report as it moves through the resolution process." },
];

function App() {
  return (
    <main>
      <nav className="nav wrap">
        <a className="brand" href="#" aria-label="CivicFix home"><span className="brand-mark">C</span> CIVICFIX</a>
        <div className="nav-links">
          <a href="#how-it-works">HOW IT WORKS</a>
          <a href="#about">ABOUT</a>
        </div>
        <a className="nav-cta" href="#get-started">GET STARTED <ArrowRight size={15} /></a>
        <button className="menu-button" aria-label="Open menu"><Menu /></button>
      </nav>

      <section className="hero wrap">
        <div className="eyebrow"><span className="eyebrow-dot" /> A BETTER WAY TO FIX WHAT'S LOCAL</div>
        <div className="hero-grid">
          <h1>YOUR CITY.<br />YOUR <span>VOICE.</span><br />YOUR FIX.</h1>
          <div className="hero-aside">
            <p className="hero-copy">Small problems shouldn't become permanent. CivicFix gives people a clear way to report civic issues and follow what happens next.</p>
            <a className="button button-blue" href="#get-started">MAKE A DIFFERENCE <ArrowRight size={17} /></a>
            <div className="hero-note"><MapPin size={15} /> BUILT AROUND YOUR NEIGHBOURHOOD</div>
          </div>
        </div>
        <div className="hero-bottom">
          <span>NOTICE IT. REPORT IT. IMPROVE IT.</span>
          <a href="#how-it-works" aria-label="Scroll to how it works"><ArrowDownRight /></a>
        </div>
      </section>

      <section className="intro wrap" id="about">
        <div className="section-label">/ THE IDEA</div>
        <div className="intro-content">
          <h2>BETTER STREETS<br />START WITH <span>US.</span></h2>
          <p>CivicFix is designed to make civic reporting more transparent and approachable. It brings local issues into view and helps communities stay informed.</p>
        </div>
      </section>

      <section className="steps-section" id="how-it-works">
        <div className="wrap">
          <div className="section-heading">
            <div className="section-label">/ HOW IT WORKS</div>
            <h2>THREE STEPS.<br /><span>REAL CHANGE.</span></h2>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <article className="step" key={step.number}>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
                <ArrowDownRight className="step-arrow" size={23} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="closing wrap" id="get-started">
        <div className="section-label">/ YOUR CITY IS WORTH IT</div>
        <div className="closing-row">
          <h2>LET'S FIX<br />WHAT <span>MATTERS.</span></h2>
          <div className="closing-aside">
            <p>One report can be the beginning of a better neighbourhood.</p>
            <a className="button button-dark" href="mailto:hello@civicfix.example">GET IN TOUCH <ArrowRight size={17} /></a>
            <small>PUBLIC SERVICE STARTS WITH PARTICIPATION.</small>
          </div>
        </div>
      </section>

      <footer className="footer wrap">
        <a className="brand" href="#"><span className="brand-mark">C</span> CIVICFIX</a>
        <span>MADE FOR BETTER COMMUNITIES.</span>
        <span>© {new Date().getFullYear()} CIVICFIX</span>
      </footer>
    </main>
  );
}

export default App;