
export default function Page() {
  return (
    <main style={{maxWidth: 720, margin: '40px auto', padding: 16, fontFamily: 'system-ui, sans-serif'}}>
      <h1 style={{fontSize: 28, fontWeight: 700}}>Tester — /api/generate-via-gpt</h1>
      <p style={{color: '#555'}}>Cole um texto e clique em Gerar para testar seu endpoint seguro.</p>
      <Form />
    </main>
  );
}

'use client';
import { useState } from 'react';

function Form() {
  const [txt, setTxt] = useState('Sono profundo e ritmos circadianos...');
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<any>(null);
  const [err, setErr] = useState<string>('');

  async function run() {
    setErr(''); setOut(null); setLoading(true);
    try {
      const res = await fetch('/api/generate-via-gpt', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ referenceText: txt, language: 'pt-BR' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro');
      setOut(data);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{marginTop: 16}}>
      <textarea value={txt} onChange={e=>setTxt(e.target.value)} rows={8} style={{width:'100%', padding:10}} />
      <div style={{marginTop: 8}}>
        <button onClick={run} disabled={loading} style={{padding:'10px 16px', background:'#2563eb', color:'#fff', borderRadius:8, border:'none'}}>
          {loading ? 'Gerando…' : 'Gerar'}
        </button>
      </div>
      {err && <p style={{color:'#b91c1c', marginTop:10}}>Erro: {err}</p>}
      {out && (
        <div style={{marginTop:16}}>
          <h3>Resposta</h3>
          <pre style={{whiteSpace:'pre-wrap', background:'#f7f7f7', padding:10, borderRadius:8}}>{JSON.stringify(out, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
