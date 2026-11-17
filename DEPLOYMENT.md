# Algonix Deployment Guide

## Deploy on Render

One Render web service runs everything: the Docker build compiles the React app and Express serves it
together with the `/api` routes, so no separate frontend service or API URL is needed.

1. Create a free MongoDB Atlas cluster and copy its connection string.
2. In [Render](https://render.com) choose **New > Blueprint** and select this repo (`render.yaml`).
3. Set `MONGODB_URI` when prompted. `JWT_SECRET` is generated for you.
4. Deploy. The app is served at `https://<service-name>.onrender.com`.

Optional: set `PISTON_URL` to run submissions on a self-hosted Piston instance; without it the
container's built-in runners (Python, Java, C++, Node) are used. Set `FRONTEND_URL` only if the
frontend is hosted on a different origin, and then also set `REACT_APP_API_URL` at build time.

Free Render services sleep after inactivity, and free Atlas clusters pause after a period without
traffic. Resume the cluster in Atlas if the API starts failing after a long gap.

---

## Run with Docker

**Prerequisites:** Docker + Docker Compose

```bash
git clone https://github.com/sanket1035/algonix.git
cd algonix
cp backend/.env.example backend/.env
# Edit backend/.env

docker-compose up --build
```

App at `http://localhost:3000`

```bash
# Stop
docker-compose down
```

---

## Run without Docker

**Prerequisites:** Node.js 18+, Python 3, G++, JDK 17

```bash
git clone https://github.com/sanket1035/algonix.git
cd algonix
npm run install-all
cp backend/.env.example backend/.env
# Edit backend/.env

npm run dev
```

Frontend: `http://localhost:3000` — Backend: `http://localhost:5000`

---

## Environment Variables

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_strong_secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

---

## Troubleshooting

**MongoDB connection failed** — Check MONGODB_URI in .env

**Port in use** — `sudo lsof -i :5000` then kill the process

**Code execution not working** — Ensure python3, g++, and java are installed on the host
