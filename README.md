<div align="center">

# ALGONIX

### Gamified Inter-College Competitive Coding Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-6C63FF?style=for-the-badge&logo=render&logoColor=white)](https://algonix-frontend.onrender.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Container%20Exec-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

> A full-stack competitive coding platform with XP-based leveling, real-time leaderboards, certificate generation, and secure container-native code execution — built for inter-college communities.

</div>

---

## Screenshots

| Dashboard | Leaderboard |
|-----------|-------------|
| ![Dashboard](./assets/dashboard.png) | ![Leaderboard](./assets/leaderboard.png) |

| Profile & Badges | Certificate of Achievement |
|-----------------|---------------------------|
| ![Profile](./assets/profile.png) | ![Certificate](./assets/certificate.png) |

---

## Features

- **Gamified Progression** — XP points, levels, streaks, and badges for every solved challenge
- **Leaderboard** — Weekly & All-Time rankings with real-time updates
- **Certificate Generation** — Auto-generated PDF certificates with digital signature on mastery completion
- **Container-Native Code Execution** — Isolated Docker containers per submission for secure, sandboxed judging
- **Anti-Plagiarism** — Structural code similarity detection to flag copied solutions
- **Placeholder Rejection** — Frontend validates against empty/boilerplate code before submission
- **User Profiles** — Track level progress, solved problems, badges, and earned certificates
- **Admin Panel** — Manage challenges, users, and platform settings
- **Responsive UI** — Works across desktop and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) |
| Code Execution | Docker (container-native, isolated) |
| Auth | JWT (JSON Web Tokens) |
| Deployment | Render (Frontend + Backend) |
| Certificate | PDF generation with digital watermark |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas URI
- Docker (for local code execution)

### Installation

```bash
# Clone the repository
git clone https://github.com/sanket1035/algonix.git
cd algonix

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

Create `.env` in `/server`:

```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Run Locally

```bash
# Start backend
cd server && npm run dev

# Start frontend (new terminal)
cd client && npm start
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/challenges` | List all challenges |
| GET | `/api/challenges/:id` | Get challenge details |
| POST | `/api/submissions` | Submit code for judging |
| GET | `/api/leaderboard` | Get leaderboard data |
| GET | `/api/profile` | Get user profile & badges |
| GET | `/api/certificates/:id` | Download certificate |

---

## Project Structure

```
algonix/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Dashboard, Challenges, Leaderboard, Profile
│   │   └── utils/        # API helpers, auth
├── server/               # Express backend
│   ├── routes/           # API route handlers
│   ├── models/           # Mongoose schemas
│   ├── middleware/        # JWT auth, error handling
│   └── execution/        # Docker-based code runner
├── DEPLOYMENT.md         # Render deployment guide
└── README.md
```

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions on Render.

**Live:** [https://algonix-frontend.onrender.com](https://algonix-frontend.onrender.com)

---

## About

Built as a flagship portfolio project by **Sanket Chaudhari**, B.Tech AI & Data Science student at K.K. Wagh Institute of Engineering Education & Research, Nashik (2026).

---

## License

MIT © [Sanket Chaudhari](https://github.com/sanket1035)
