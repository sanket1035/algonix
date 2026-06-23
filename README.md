# Algonix

A gamified coding skill development platform. Practice algorithms, earn badges, climb leaderboards, and unlock challenges through skill tests or progressive completion.

🔗 **Live Demo:** https://algonix-frontend.onrender.com

## Features

- **Coding Challenges** — Multi-difficulty (Beginner → Expert) with progressive unlocking
- **Skill Tests** — MCQ-based fast-track unlocking by difficulty level
- **Code Editor** — Monaco Editor with multi-language support (JS, Python, Java, C++)
- **LeetCode-Style Submissions** — Write standard class or function-based solutions (`class Solution`, `def two_sum`, etc.). The platform automatically wraps and executes them with input-injecting test runners.
- **Gamification** — Points, levels, badges, streaks, and certificates
- **Leaderboards** — Weekly and all-time rankings
- **Admin Panel** — Manage challenges, users, and platform stats

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Material-UI, TanStack Query, Monaco Editor |
| Backend | Node.js, Express.js, MongoDB/Mongoose, JWT |
| Code Execution | **Container-Native Execution** (Node, Python 3, G++, JDK 17) |
| DevOps | Docker, Docker Compose, Nginx |

## Code Execution Architecture

Algonix uses **Container-Native Execution** to compile and run student submissions:
- **No External Dependencies**: External whitelisted compilers (like public Piston) and DNS-blocked services (like Glot API) have been completely removed.
- **Deployment-Isolated**: The deployment containers (on Render/Railway or local Docker) are pre-installed with `python3`, `g++`, and `openjdk17-jdk`. Submissions are executed natively and securely inside the container.
- **Local Fallback**: During local development, the backend will automatically compile and run code using your local computer's native runtimes, requiring zero Docker configuration.

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3, G++, and JDK (if testing C++/Java locally without Docker)

### Local Development

1. **Install all dependencies**
   ```bash
   npm run install-all
   ```

2. **Configure environment**
   ```bash
   cp backend/.env.example backend/.env
   ```
   *Edit `backend/.env` with your MongoDB connection details. No `GLOT_TOKEN` or `PISTON_URL` is required.*

3. **Start dev servers** (Frontend on `:3000`, Backend on `:5000`)
   ```bash
   npm run dev
   ```

---

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/algonix
JWT_SECRET=<your_strong_secret>
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

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

---

## Deployment

### Cloud Platforms

**Render / Railway**
- Simply link your repository to Render or Railway.
- The included `Dockerfile` and `render.yaml` are pre-configured to build the frontend, package the server, and install Python, C++, and Java runtimes automatically.

---

## Security

- JWT authentication with 7-day expiry
- bcrypt password hashing
- Nginx rate limiting (API: 10 req/s, login: 5 req/min)
- CORS restricted to configured origins
- Security headers via Nginx

## License

MIT
