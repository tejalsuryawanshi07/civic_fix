import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import type { Session } from "@supabase/supabase-js";
import { LayoutDashboard, LogIn, LogOut, UserRound, X } from "lucide-react";
import { supabase } from "../../utils/supabase";

type AuthMode = "sign-in" | "sign-up";

export function AuthPanel() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) setError(sessionError.message);
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        setIsOpen(false);
        setPassword("");
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;
    setIsAdmin(false);
    if (!supabase || !session?.user.id) return () => { active = false; };
    void supabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle()
      .then(({ data }) => {
        if (active) setIsAdmin(data?.role === "admin");
      });
    return () => { active = false; };
  }, [session?.user.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, busy]);

  const openAuth = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError("");
    setMessage("");
    setIsOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to frontend/.env, then restart the development server.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "sign-up") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (authError) throw authError;
        setPassword("");
        setMessage(data.session
          ? "Your CivicFix account is ready. You're signed in."
          : "Account created. Check your inbox and confirm your email before signing in.");
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (authError) throw authError;
        setPassword("");
        setMessage("Sign-in successful.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't complete that request. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    setError("");
    const { error: authError } = await supabase.auth.signOut();
    if (authError) setError(authError.message);
    else setMessage("You have been signed out.");
  };

  const displayName = String(session?.user.user_metadata?.full_name ?? "").trim() || session?.user.email?.split("@")[0] || "Account";

  return (
    <>
      {session ? (
        <div className="auth-signed-in">
          <span className="auth-user" title="Signed in"><UserRound size={15} /> {displayName}</span>
          {isAdmin && window.location.pathname !== "/admin" && (
            <a className="auth-trigger auth-admin-link" href="/admin"><LayoutDashboard size={15} /><span>Admin Dashboard</span></a>
          )}
          <button className="auth-trigger" type="button" onClick={signOut}><LogOut size={15} /><span>Sign out</span></button>
        </div>
      ) : (
        <div className="auth-entry-actions">
          <button className="auth-trigger" type="button" onClick={() => openAuth("sign-in")}><LogIn size={15} /><span>Sign in</span></button>
        </div>
      )}

      {isOpen && !session && createPortal(
        <div className="auth-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !busy) setIsOpen(false);
        }}>
          <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title" aria-describedby="auth-description">
            <button className="auth-close" type="button" aria-label="Close authentication dialog" onClick={() => setIsOpen(false)} disabled={busy}><X size={19} /></button>
            <div className="auth-brand"><span className="brand-icon"><UserRound size={17} /></span><span>CivicFix account</span></div>
            <h2 id="auth-title">{mode === "sign-in" ? "Welcome back." : "Join your neighbourhood."}</h2>
            <p className="auth-intro" id="auth-description">{mode === "sign-in" ? "Sign in to access your citizen account." : "Create your account to get started with CivicFix."}</p>

            <form onSubmit={submit} className="auth-form">
              {mode === "sign-up" && (
                <label>Full name
                  <input autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required maxLength={100} placeholder="Enter your full name" />
                </label>
              )}
              <label>Email address
                <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" />
              </label>
              <label>Password
                <input type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={mode === "sign-up" ? 8 : undefined} required placeholder={mode === "sign-up" ? "At least 8 characters" : "Enter your password"} />
              </label>
              <button className="button button-primary auth-submit" type="submit" disabled={busy}>
                {busy ? "Please wait…" : mode === "sign-in" ? "Sign in to CivicFix" : "Create my account"}
              </button>
            </form>

            {mode === "sign-in" && (
              <p className="auth-switch-copy">
                New user?{" "}
                <button type="button" onClick={() => { setMode("sign-up"); setError(""); setMessage(""); setPassword(""); }}>
                  Sign up
                </button>
              </p>
            )}

            {error && <p className="auth-feedback error" role="alert">{error}</p>}
            {message && <p className="auth-feedback success" role="status">{message}</p>}
            <p className="auth-privacy">Your password is securely managed by Supabase. Public registrations receive citizen access.</p>
          </section>
        </div>,
        document.body
      )}
    </>
  );
}
