
# Carousel GPT Server (Next.js App Router)

Este projeto cria um endpoint seguro que chama seu GPT compartilhado (Responses API via gizmo_id) e devolve textos de slides.

## O que é "servidor"?
É o "lugar" (na internet) onde seu código roda 24h. Ex.: Vercel, Netlify, Render, etc. Ele recebe pedidos do seu site/ferramenta e responde.

## O que é `.env.local`?
É um arquivo secreto que guarda chaves e senhas (como sua OPENAI_API_KEY). Ele não vai para o navegador nem para repositórios públicos.

## Passo a passo
1. Crie uma conta no GitHub e no Vercel (grátis).
2. Baixe este projeto (.zip), descompacte e faça upload para um repositório no seu GitHub.
3. No Vercel, clique em "Add New Project" > importe seu repositório.
4. Em "Environment Variables", crie:
   - `OPENAI_API_KEY` = sua chave (NUNCA exponha publicamente).
   - `GIZMO_ID` = 68e54913-48d0-800e-889b-12abd4af22ad
   - `TIMEOUT_MS` = 60000
5. Deploy. O Vercel te dará uma URL, por ex.: https://seu-projeto.vercel.app
6. Teste acessando a raiz do site e apertando **Gerar** ou faça:
   ```bash
   curl -X POST https://seu-projeto.vercel.app/api/generate-via-gpt        -H 'Content-Type: application/json'        -d '{ "referenceText": "Sono profundo...", "language": "pt-BR" }'
   ```
7. Na sua ferramenta frontend, faça `POST` para:
   `https://seu-projeto.vercel.app/api/generate-via-gpt` enviando `{ referenceText, language }`.
   A resposta vem como `{ rows: [{ slide, texto }, ...] }`.

## O que são Express e NestJS?
- **Express**: biblioteca simples para criar APIs em Node.js. Você monta as rotas “na mão”.
- **NestJS**: framework mais completo em cima do Node, com estrutura organizada (módulos, controladores, serviços).

## Dica de segurança
Nunca coloque sua chave em arquivos públicos, repositórios, ou no navegador. Guarde somente em variáveis de ambiente do servidor.
