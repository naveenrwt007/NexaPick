# AI Product Recommender

A small React + Vite assessment project that demonstrates:

**React → Vercel API route → OpenAI → product IDs → local product filtering → UI**

This is intentionally simple enough to explain during a 90-minute AI Engineer assessment.

## Features

- React + Vite frontend
- Local product catalogue with 6 smartphones
- Natural-language preference input
- OpenAI Responses API integration
- Server-side API key
- AI returns product IDs/reasons
- Server validates IDs against the local catalogue
- Recommended products are rendered separately
- Loading, error, and empty states
- Responsive UI
- Vercel-ready `/api/recommend` function

## 1. Install

Requirements:

- Node.js 22+
- An OpenAI API key
- Vercel account for deployment

```bash
npm install
```

## 2. Local environment

Copy `.env.example` to `.env.local`:

```bash
# Windows PowerShell
Copy-Item .env.example .env.local
```

Then edit `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Never commit `.env.local`.

## 3. Run locally

For the full Vercel-style frontend + API environment, use the Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

Open the URL shown by Vercel, usually `http://localhost:3000`.

You can also run the frontend alone with:

```bash
npm run dev
```

but `/api/recommend` requires a serverless-function environment.

## 4. Test

Try:

- `I want a phone under $500 with a good camera`
- `I need a phone with long battery life`
- `I want the best phone for photography`
- `I want something under $400`
- `I need fast charging and strong performance`

## 5. How the AI integration works

The browser sends only the user's preference:

```text
POST /api/recommend
{
  "query": "I want a phone under $400 with a good camera"
}
```

The server sends the preference plus the catalogue to OpenAI.

The model is instructed to return product IDs only from the catalogue.

The server then performs a second safety check:

```js
const product = products.find(
  (p) => p.id === productId
);
```

Only real catalogue products are returned to the frontend.

This prevents an AI-generated product name from being displayed as if it were a real catalogue item.

## 6. Deploy to Vercel

### Option A — GitHub

1. Create a GitHub repository.
2. Push this project.
3. Import the repository into Vercel.
4. Vercel detects Vite automatically.
5. Add the environment variable:

```text
OPENAI_API_KEY = your_openai_api_key
```

6. Deploy.

### Option B — Vercel CLI

From the project folder:

```bash
npm install
npm run build
npm install -g vercel
vercel
```

Follow the prompts.

Then add the production environment variable in Vercel:

```text
OPENAI_API_KEY
```

Redeploy after adding/changing environment variables.

## Assessment explanation

If asked "Why did you use AI here?":

> I use the AI model to understand the user's natural-language preferences and map them to product IDs from a predefined catalogue. The application then filters the actual product data using those IDs, so the AI cannot invent products that don't exist in the catalogue.

## Project structure

```text
ai-product-recommender/
├── api/
│   └── recommend.js
├── src/
│   ├── components/
│   │   ├── ProductCard.jsx
│   │   └── SearchBox.jsx
│   ├── data/
│   │   └── products.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vercel.json
├── vite.config.js
└── README.md
```
