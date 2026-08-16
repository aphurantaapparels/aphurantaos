"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function accessWithPassword(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { password, redirect: false });
    if (result?.error) {
      setError("That access code is not correct.");
      setLoading(false);
      return;
    }
    window.location.href = "/";
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-logo"><span>A</span><strong>APHURANTA</strong></div>
        <div>
          <p>APPAREL OPERATIONS</p>
          <h1>One flow.<br />Every order.</h1>
          <p className="login-copy">From first client contact to final delivery, keep every decision, approval, and payment connected.</p>
        </div>
        <small>APHURANTA OS · DHAKA</small>
      </section>
      <section className="login-form-panel">
        <div className="login-card">
          <p className="eyebrow">SECURE WORKSPACE</p>
          <h2>Welcome back.</h2>
          <p>Sign in to continue to apparel operations.</p>
          <button className="google-login" onClick={() => signIn("google", { callbackUrl: "/" })}>
            <b>G</b> Continue with Google
          </button>
          <div className="login-divider"><span>or use access code</span></div>
          <form onSubmit={accessWithPassword}>
            <label htmlFor="password">Access code</label>
            <input id="password" name="password" type="password" inputMode="numeric" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your access code" required />
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="login-submit" type="submit" disabled={loading}>{loading ? "Checking…" : "Enter Aphuranta OS"}</button>
          </form>
          <small>Authorized Aphuranta staff only</small>
        </div>
      </section>
    </main>
  );
}
