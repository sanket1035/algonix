# Algonix

A gamified coding skill development platform. Practice algorithms, earn badges, climb leaderboards, and unlock challenges through skill tests or progressive completion.

## Features

- **Coding Challenges** — Multi-difficulty (Beginner → Expert) with progressive unlocking
- **Skill Tests** — MCQ-based fast-track unlocking by difficulty level
- **Code Editor** — Monaco Editor with multi-language support (JS, Python, Java, C++)
- **Gamification** — Points, levels, badges, streaks, and certificates
- **Leaderboards** — Weekly and all-time rankings
- **Admin Panel** — Manage challenges, users, and platform stats

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Material-UI, TanStack Query, Monaco Editor |
| Backend | Node.js, Express.js, MongoDB/Mongoose, JWT |
| Code Execution | Judge0 API (RapidAPI) |
| DevOps | Docker, Docker Compose, Nginx |

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- [Judge0 API key](https://rapidapi.com/judge0-official/api/judge0-ce/) from RapidAPI

### With Docker (Recommended)

```bash
git clone <repository-url>
cd algonix

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT_SECRET, RAPIDAPI_KEY, FRONTEND_URL

docker-compose up -d
```

App will be available at `http://localhost`.

### Local Development

```bash
# Install all dependencies
npm run install-all

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:6.0

# Start dev servers (frontend :3000, backend :5000)
npm run dev
```

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/algonix
JWT_SECRET=<your_strong_secret>
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
RAPIDAPI_KEY=<your_rapidapi_key>
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

> **Never commit `.env` to version control.** It is listed in `.gitignore`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/challenges` | List challenges |
| GET | `/api/challenges/:id` | Get challenge |
| POST | `/api/challenges/skill-test` | Get skill test questions |
| POST | `/api/challenges/skill-test/submit` | Submit skill test |
| POST | `/api/submissions` | Submit solution |
| GET | `/api/submissions/my-submissions` | User submissions |
| GET | `/api/leaderboard/weekly` | Weekly leaderboard |
| GET | `/api/leaderboard/all-time` | All-time leaderboard |

## Deployment

### Cloud Platforms

**Render / Railway** — Use the included `render.yaml` / `railway.json`. Set env vars in the platform dashboard.

**AWS**
- Backend: ECS or EC2 with Docker
- Database: MongoDB Atlas or DocumentDB
- Frontend build served via Express static or S3 + CloudFront

### Production Docker

```bash
docker-compose up -d --build
```

For HTTPS, place SSL certificates in `./ssl/` and update `nginx.conf`.

## Database

MongoDB collections:

- `users` — profiles, stats, badges, certificates, solved/unlocked challenges
- `challenges` — problem statements, test cases, starter code
- `submissions` — code submissions and results

## Security

- JWT authentication with 7-day expiry
- bcrypt password hashing
- Nginx rate limiting (API: 10 req/s, login: 5 req/min)
- CORS restricted to configured origins
- Security headers via Nginx

## License

MIT
