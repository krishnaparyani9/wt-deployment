# Atlas CRM

A responsive CRM admin portal built with React, TypeScript, Express, and MongoDB.
This application is published in the `wt-deployment` repository.

## Project structure

```text
atlas-crm/
├── backend/
│   ├── src/
│   │   ├── config/       # MongoDB connection
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── app.ts        # Express middleware and routes
│   │   └── index.ts      # API startup
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Shared UI and forms
│   │   ├── lib/          # Formatting helpers
│   │   ├── pages/        # Dashboard, products, lines, people, orders, settings
│   │   ├── App.tsx       # Application state and page layout
│   │   └── main.tsx      # React entry point
│   ├── index.html
│   └── vite.config.ts
├── package.json
└── tsconfig.json
```

## Get started

1. Install dependencies from the project root with `npm install`.
2. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` to your MongoDB connection string.
3. Start both the frontend and API from the project root with `npm run dev`, or from `frontend/` with `npm run dev`.
4. Open the Vite address printed in the terminal (usually `http://localhost:5173`).

The frontend runs on port 5173 and proxies `/api` requests to the Express API on port 5001. All CRM records are loaded from and saved to MongoDB through the backend API. If MongoDB is unavailable, the application shows a connection error and does not use browser-local storage as a fallback.

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the MongoDB Atlas, Render, and Vercel setup steps.

## Commands

- `npm run dev` from the project root or `frontend/` starts the frontend and backend in development mode. An already-running CRM API is reused; another app using port 5001 is reported clearly.
- `npm run dev` from `backend/` starts only the API.
- `npm run build` type-checks both projects and builds the frontend into `frontend/dist`.
- `npm run typecheck` checks the frontend and backend TypeScript projects.
- `npm start` starts the Express API.
- `npm run preview` previews the production frontend build.
