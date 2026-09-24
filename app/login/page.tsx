"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(""); const result = await signIn("credentials", { password, redirect: false, callbackUrl: "/" }); if (result?.error) setError("That access code was not accepted."); else window.location.href = "/"; };
  return <main className="login-page"><form className="login-card" onSubmit={submit}><div className="brand-mark">A</div><p className="eyebrow">Aphuranta workspace</p><h1>Welcome back.</h1><p className="muted">Use your private workspace access code to continue.</p><label className="field"><span>Access code</span><input type="password" autoComplete="current-password" inputMode="numeric" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error ? <p className="form-error">That code was not accepted. Repeated failures are temporarily blocked.</p> : null}<button className="primary" type="submit">Continue</button></form></main>;
}
