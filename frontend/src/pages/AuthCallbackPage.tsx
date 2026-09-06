import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../shared/supabase";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    if (!supabase || !code) {
      setError("The confirmation link is invalid or has expired.");
      return;
    }

    let active = true;
    void supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (!active) return;
      if (exchangeError) {
        setError(exchangeError.message);
        return;
      }
      navigate("/dashboard", { replace: true });
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <section className="auth-page">
      <div className="auth-card auth-callback">
        <h1>Confirming your account…</h1>
        {error ? (
          <>
            <p className="auth-message error">{error}</p>
            <Link className="btn primary" to="/auth">
              Return to sign in
            </Link>
          </>
        ) : (
          <p className="muted">Please wait while we finish signing you in.</p>
        )}
      </div>
    </section>
  );
}
