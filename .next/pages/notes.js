// pages/notes.js
import { useEffect, useState } from 'react';
import Router from 'next/router';

function api(url, opts={}) {
  const token = localStorage.getItem('token');
  opts.headers = { ...(opts.headers||{}), Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  return fetch(url, opts);
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  const tenantSlug = typeof window !== 'undefined' ? localStorage.getItem('tenantSlug') : null;

  async function load() {
    const res = await api('/notes');
    if (!res.ok) {
      if (res.status === 401) return Router.push('/login');
      setError('Failed to load notes');
      return;
    }
    setNotes(await res.json());
  }

  useEffect(()=>{ load(); }, []);

  async function createNote(e) {
    e.preventDefault();
    setError('');
    const res = await api('/notes', { method: 'POST', body: JSON.stringify({ title, content }) });
    const j = await res.json();
    if (res.ok) {
      setTitle(''); setContent(''); load();
    } else if (j.code === 'PLAN_LIMIT' || j.error?.includes('limit')) {
      // Show upgrade prompt
      if (role === 'ADMIN') {
        if (confirm('Free plan limit reached. Upgrade tenant to Pro now?')) {
          const upr = await api(`/tenants/${tenantSlug}/upgrade`, { method: 'POST' });
          if (upr.ok) { alert('Upgraded'); load(); }
          else { alert('Upgrade failed'); }
        }
      } else {
        alert('Tenant has reached note limit. Please ask your Admin to upgrade.');
      }
    } else {
      setError(j.error || 'Create failed');
    }
  }

  async function del(id) {
    const res = await api(`/notes/${id}`, { method: 'DELETE' });
    if (res.ok) load();
    else alert('Delete failed');
  }

  return (
    <div style={{maxWidth:800, margin:'2rem auto'}}>
      <h1>Notes</h1>
      <form onSubmit={createNote}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" required />
        <br />
        <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Content" />
        <br />
        <button type="submit">Create</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
      <ul>
        {notes.map(n => (
          <li key={n.id}>
            <b>{n.title}</b> — {n.content}
            <button onClick={()=>del(n.id)} style={{marginLeft:8}}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
