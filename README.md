# Private Credit Tool

Full app explanation is in [SYSTEM_EXPLANATION.md](SYSTEM_EXPLANATION.md).

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Set up environment variables. You will need to get the API key for one LLM provider you want to use. The system supports OpenAI, Anthropic and Gemini. For other environment variables, you can use the example values.

```bash
cp .env.example .env
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
