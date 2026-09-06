import { LockKeyhole, Mail } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../shared/AuthProvider";

type Mode = "login" | "register";

export default function AuthPage() {
  const { configured, loading, user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === "register") {
        await signUp(email, password);
        setNotice("Check your inbox and confirm your email before signing in.");
      } else {
        await signIn(email, password);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-heading">
          <LockKeyhole size={22} />
          <div>
            <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
            <p className="muted">Sign in to synchronize progress across your devices.</p>
          </div>
        </div>

        {!configured && (
          <p className="auth-message error">
            Authentication is not configured. Add the Supabase variables from{" "}
            <code>frontend/.env.example</code>.
          </p>
        )}

        <form className="auth-form" onSubmit={submit}>
          <label>
            Email
            <span className="auth-input">
              <Mail size={16} />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </span>
          </label>

          <label>
            Password
            <span className="auth-input">
              <LockKeyhole size={16} />
              <input
                type="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </span>
          </label>

          {error && <p className="auth-message error">{error}</p>}
          {notice && <p className="auth-message success">{notice}</p>}

          <button
            className="btn primary auth-submit"
            type="submit"
            disabled={!configured || submitting}
          >
            {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Register"}
          </button>
        </form>

        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setMode((current) => (current === "login" ? "register" : "login"));
            setError(null);
            setNotice(null);
          }}
        >
          {mode === "login" ? "New to QuantPrep? Create an account" : "Already registered? Sign in"}
        </button>

        <Link className="back-link auth-back" to="/questions">
          Continue without an account
        </Link>
      </div>
    </section>
  );
}
