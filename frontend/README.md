
# Prepzen — Frontend

A fast, modern **AI‑powered interview preparation** web app frontend built with **Vite + React + TypeScript**, styled with **Tailwind CSS**, and tested with **Vitest**. It provides an engaging dashboard and report cards to help users practice and track progress.

> This README describes the **frontend** package found at `AI_Prep_App/frontend`.

---

## ✨ Features
- ⚡ **Vite** dev server for instant HMR
- 🧠 **TypeScript** for type‑safe components
- 🎨 **Tailwind CSS** utility‑first styling
- 🧪 **Vitest** + `@testing-library` ready (see `vitest.config.ts`)
- ✅ **ESLint** configured for consistent code quality
- 🚀 **Vercel** ready deployment (`vercel.json` included)
- 📊 **Dashboard & report card** functionality (see `src/`)

---

## 📁 Project Structure
```
frontend/
├─ public/
├─ src/
│  ├─ assets/
│  ├─ components/
│  ├─ pages/
│  ├─ hooks/
│  ├─ lib/
│  └─ main.tsx
├─ index.html
├─ package.json
├─ vite.config.ts
├─ tailwind.config.ts
├─ postcss.config.js
├─ tsconfig*.json
├─ eslint.config.js
├─ vitest.config.ts
└─ vercel.json
```
> Note: Exact directories under `src/` may vary—adjust as needed.

---

## 🛠️ Prerequisites
- **Node.js** ≥ 18 (LTS recommended) or **Bun** ≥ 1.0
- **npm** ≥ 9 or **bun** package manager

> A `bun.lock` file is present — you can use **Bun** for faster installs, but npm works as well.

---

## 🚀 Getting Started

### 1) Clone and install
```bash
# clone the monorepo/repo and go to frontend
cd AI_Prep_App/frontend

# using bun (recommended if bun.lock exists)
bun install

# or using npm
npm install
```

### 2) Run the dev server
```bash
# bun
bun run dev

# npm
npm run dev
```
The app should be available at `http://localhost:5173/` by default (Vite).

### 3) Build for production
```bash
# bun
bun run build

# npm
npm run build
```
This creates an optimized build in `dist/`.

### 4) Preview the production build
```bash
# bun
bun run preview

# npm
npm run preview
```

---

## 📦 Common Scripts (package.json)
These may vary slightly; typical scripts include:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview --open",
    "test": "vitest",
    "lint": "eslint . --ext .ts,.tsx"
  }
}
```

---

## 🔧 Configuration
- **Tailwind**: `tailwind.config.ts` and `postcss.config.js`
- **TypeScript**: `tsconfig.json`, `tsconfig.app.json`
- **Vite**: `vite.config.ts`
- **Vitest**: `vitest.config.ts`
- **ESLint**: `eslint.config.js`
- **Deployment**: `vercel.json`

If your app needs environment variables, create a `.env` file at the project root:
```
# example
VITE_API_BASE_URL=https://api.example.com
```
> Only variables prefixed with `VITE_` are exposed to the client at build time.

---

## 🧪 Testing
Run unit and component tests with Vitest:
```bash
# bun
bun run test

# npm
npm test
```
You can generate coverage with:
```bash
# bun
bun run test --coverage

# npm
npm test -- --coverage
```

---

## 🧹 Linting & Formatting
```bash
# lint
bun run lint
# or
npm run lint
```
Consider adding Prettier if not already present for opinionated formatting.

---

## 🚀 Deployment (Vercel)
With `vercel.json` present, you can deploy using the Vercel CLI or Git integration.

**Vercel CLI**
```bash
# from the frontend directory
vercel
# or
vercel --prod
```

**Build Output**
- Set the build command to `npm run build` (or `bun run build`).
- Set the output/public directory to `dist`.

---

## 🧭 Troubleshooting
- If styles don’t apply, ensure Tailwind content globs include your `src/**/*.{ts,tsx,html}`.
- If HMR fails, verify no other process is occupying port `5173`.
- If TypeScript fails on path aliases, check `tsconfig.json` and `vite.config.ts` alias config.

---

## 🤝 Contributing
1. Fork the repo
2. Create a feature branch: `git checkout -b feat/awesome`
3. Commit changes: `git commit -m "feat: add awesome"`
4. Push branch: `git push origin feat/awesome`
5. Open a Pull Request

---

## 📄 License
Specify your license (e.g., MIT) here. If a LICENSE file exists at repo root, mirror it.

---

## 🙌 Acknowledgements
- Built with **Vite**, **React**, **TypeScript**, **Tailwind**, **Vitest**, and **Vercel**

