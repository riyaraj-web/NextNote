// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [err, setErr] = useState('');
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setErr('');
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const j = await res.json();
    if (!res.ok) return setErr(j.error || 'Login failed');
    localStorage.setItem('token', j.token);
    localStorage.setItem('role', j.user.role);
    localStorage.setItem('tenantSlug', j.user.tenantSlug);
    router.push('/notes');
  }

  return (
    <div style={{maxWidth:600, margin:'2rem auto'}}>
      <h1>Login</h1>
      <form onSubmit={submit}>
        <div>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
        </div>
        <div>
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" />
        </div>
        <button type="submit">Login</button>
        {err && <p style={{color:'red'}}>{err}</p>}
      </form>
      <p>Use the predefined accounts (password = <b>password</b>).</p>
    </div>
  );
}
