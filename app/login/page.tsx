"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);

    try {
      const result = await signIn("credentials", {
        password,
        redirect: false,
        callbackUrl: "/",
      });

      if (!result || !result.ok || result.error) {
        setPassword("");
        setError("That access code was not accepted. Repeated failures are temporarily blocked.");
        setSubmitting(false);
        return;
      }

      window.location.assign(result.url || "/");
    } catch {
      setError("The login service did not respond. Please try again.");
      setSubmitting(false);
    }
  };

  return <main className="login-page"><form className="login-card" onSubmit={submit}><div className="brand-mark">A</div><p className="eyebrow">Aphuranta workspace</p><h1>Welcome back.</h1><p className="muted">Use your private workspace access code to continue.</p><label className="field"><span>Access code</span><input type="password" autoComplete="current-password" inputMode="numeric" value={password} onChange={(event) => setPassword(event.target.value)} disabled={submitting} required /></label>{error ? <p className="form-error">{error}</p> : null}<button className="primary" type="submit" disabled={submitting}>{submitting ? "Checking…" : "Continue"}</button></form></main>;
}
