# Algonix Deployment Guide

## Deploy on Render (Live)

The app is currently deployed on Render using the included `render.yaml`.

1. Fork the repo
2. Connect to [Render](https://render.com)
3. Select "New Blueprint" and point to the repo
4. Set environment variables (see below)
5. Deploy

**Live:** https://algonix-frontend.onrender.com

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
