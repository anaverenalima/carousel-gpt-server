
import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const GIZMO_ID = process.env.GIZMO_ID || '68e54913-48d0-800e-889b-12abd4af22ad';
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 60000);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { referenceText = '', language = 'pt-BR' } = await req.json();

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'SERVER_MISCONFIG: missing OPENAI_API_KEY' }, { status: 500 });
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const prompt = [
      'Por favor, gere textos de slides para um carrossel (até 9) seguindo o guideline do meu GPT. ',
      'Entregue exclusivamente em JSON: { "rows": [{ "slide": string, "texto": string }, ...] }. ',
      `Idioma: ${language}.`,
      '\n\nTexto/Notas de referência:\n' + (referenceText || '(vazio)')
    ].join('');

    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ gizmo_id: GIZMO_ID, input: prompt }),
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: 'UPSTREAM_ERROR', detail: text }, { status: 502 });
    }

    const data = await res.json();
    const text = (data?.output_text)
      || (Array.isArray(data?.output) ? data.output.map((x:any)=>x?.content?.[0]?.text?.value || '').join('\n') : '')
      || '';

    let rows:any[] = [];
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed?.rows)) rows = parsed.rows;
    } catch {}

    if (!rows.length) {
      rows = fallbackParseToRows(text);
    }

    if (!rows.length) {
      return NextResponse.json({ error: 'BAD_MODEL_OUTPUT', raw: text.slice(0, 2000) }, { status: 500 });
    }

    rows = rows
      .filter((r:any) => r?.slide && r?.texto)
      .map((r:any) => ({ slide: String(r.slide).slice(0,120), texto: String(r.texto).trim() }));

    return NextResponse.json({ rows });
  } catch (e:any) {
    const status = e?.name === 'AbortError' ? 504 : 500;
    return NextResponse.json({ error: 'UNHANDLED', detail: String(e?.message || e) }, { status });
  }
}

function fallbackParseToRows(text:string) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const rows:any[] = [];
  let cur:any = null;
  for (const ln of lines) {
    const m = ln.match(/^\s*(Slide\s*\d+[^:]*):\s*(.*)$/i);
    if (m) {
      if (cur) rows.push(cur);
      cur = { slide: m[1].trim(), texto: m[2].trim() };
    } else if (cur) {
      cur.texto += '\n' + ln.trim();
    }
  }
  if (cur) rows.push(cur);
  return rows;
}
