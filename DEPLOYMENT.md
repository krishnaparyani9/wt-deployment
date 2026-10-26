# Deploy Atlas CRM

The production setup uses MongoDB Atlas for the database, Render for the Express API, and Vercel for the Vite frontend.

## 1. Create the production database

1. Create a MongoDB Atlas account and a cluster.
2. Add a database user with a strong password. This is a MongoDB database user, not your Atlas website login.
3. In Atlas **Network Access**, allow connections from `0.0.0.0/0` so Render's changing outbound addresses can reach the cluster. Use a dedicated database user and a strong password.
4. Copy the cluster's application connection string. Replace `<db_username>` and `<db_password>` with the database user's credentials, URL-encode special characters in the password, and use `atlas_crm` as the database name.
5. Keep the connection string private. Do not commit it or place it in frontend settings.

## 2. Deploy the API on Render

1. In Render, create a **Blueprint** using this GitHub repository. Render reads [`render.yaml`](./render.yaml).
2. When prompted, set `MONGODB_URI` to the Atlas connection string.
3. Deploy the `atlas-crm-api` web service.
4. Confirm the service is healthy and `https://<your-render-service>.onrender.com/api/health` returns `{"status":"ok","database":"connected"}`. Save the service's base URL.

## 3. Deploy the frontend on Vercel

1. Import the same GitHub repository into Vercel.
2. Set the project **Root Directory** to `frontend`.
3. Add `VITE_API_URL` as an environment variable with the Render API base URL, for example `https://atlas-crm-api.onrender.com` (no `/api` suffix).
4. Deploy the frontend and copy its production URL.

## 4. Allow the deployed frontend

1. In the Render service environment, set `FRONTEND_URL` to the exact Vercel production origin, for example `https://atlas-crm.vercel.app` (no trailing slash).
2. Save the environment change and let Render redeploy.
3. Open the Vercel site, create a test record, reload the page, and confirm the record remains. Verify the Render health endpoint reports MongoDB as connected.

For local development, `backend/.env` is not committed. Use `backend/.env.example` as a template. Keep real database credentials in Render's environment settings and local ignored `.env` files only.
