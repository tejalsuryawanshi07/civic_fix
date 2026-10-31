import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { LogIn, LogOut, UserRound, X } from "lucide-react";
import { supabase } from "../../utils/supabase";

type AuthMode = "sign-in" | "sign-up";

export function AuthPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Authentication is not configured yet. Add the Supabase environment variables to your deployment.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "sign-up") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (authError) throw authError;
        if (data.session) {
          setMessage("Your CivicFix account has been created.");
        } else {
          setMessage("Account created. Check your email for the confirmation link before signing in.");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
        setMessage("You're signed in.");
      }
      setPassword("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error: authError } = await supabase.auth.signOut();
    if (authError) setError(authError.message);
    else {
      setMessage("You have been signed out.");
      setIsOpen(false);
    }
  };

  return (
    <>
      {session ? (
        <div className="auth-signed-in">
          <span className="auth-user"><UserRound size={15} /> {session.user.email}</span>
          <button className="auth-trigger" type="button" onClick={signOut}><LogOut size={15} /> Sign out</button>
        </div>
      ) : (
        <button className="auth-trigger" type="button" onClick={() => { setIsOpen(true); setError(""); setMessage(""); }}>
          <LogIn size={15} /> Sign in
        </button>
      )}

      {isOpen && !session && (
        <div className="auth-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}>
          <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <button className="auth-close" type="button" aria-label="Close sign in" onClick={() => setIsOpen(false)}><X size={19} /></button>
            <div className="section-label">CIVICFIX ACCOUNT</div>
            <h2 id="auth-title">{mode === "sign-in" ? "Welcome back." : "Join your neighbourhood."}</h2>
            <p className="auth-intro">{mode === "sign-in" ? "Sign in to continue to your citizen account." : "Create an account to get started with CivicFix."}</p>
            <div className="auth-tabs">
              <button type="button" className={mode === "sign-in" ? "active" : ""} onClick={() => { setMode("sign-in"); setError(""); setMessage(""); }}>Sign in</button>
              <button type="button" className={mode === "sign-up" ? "active" : ""} onClick={() => { setMode("sign-up"); setError(""); setMessage(""); }}>Create account</button>
            </div>
            <form onSubmit={submit} className="auth-form">
              {mode === "sign-up" && <label>Full name<input autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required maxLength={100} /></label>}
              <label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
              <label>Password<input type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></label>
              <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}</button>
            </form>
            {error && <p className="auth-feedback error" role="alert">{error}</p>}
            {message && <p className="auth-feedback success" role="status">{message}</p>}
            <p className="auth-privacy">Passwords are handled by Supabase Auth. Public sign-up creates citizen accounts only.</p>
          </section>
        </div>
      )}
    </>
  );
}
