# Algonix - Gamified Coding Skill Development Platform

A comprehensive full-stack web application for learning and practicing coding skills through gamified challenges, competitions, and skill assessments.

## 🚀 Features

### Core Features
- **User Authentication & Profiles**: Secure registration/login with comprehensive profile management
- **Coding Challenges**: Multi-difficulty challenges (Beginner → Expert) with progressive unlocking
- **Dual Access Paths**: 
  - Progressive unlocking through prerequisite completion
  - Fast-track skill test-based unlocking
- **Code Execution**: Sandboxed code evaluation using Judge0 API
- **Multi-language Support**: JavaScript, Python, Java, C++

### Gamification Elements
- **Points System**: Earn points for solving challenges
- **Badges**: Achievement system (First Solve, Daily Streak, Problem Slayer, etc.)
- **Levels**: Progressive leveling based on total points
- **Certificates**: PDF certificates for milestone completions
- **Leaderboards**: Real-time weekly and all-time rankings
- **Streaks**: Daily solving streak tracking

### User Experience
- **Personal Dashboard**: Progress tracking, stats visualization, quick actions
- **Code Editor**: Monaco Editor with syntax highlighting and multi-language support
- **Real-time Feedback**: Instant test case results and performance metrics
- **Responsive Design**: Mobile-friendly Material-UI interface

### Admin Features
- **Challenge Management**: Create, edit, delete challenges
- **User Management**: Monitor user progress and statistics
- **Analytics Dashboard**: Platform usage statistics
- **Content Control**: Manage challenge difficulty and prerequisites

## 🛠 Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Judge0 API** for code execution
- **Puppeteer** for PDF certificate generation
- **Node-cron** for scheduled tasks

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for components
- **React Router** for navigation
- **TanStack Query** for state management
- **Monaco Editor** for code editing
- **Recharts** for data visualization

### DevOps & Deployment
- **Docker** containerization
- **Docker Compose** for multi-service orchestration
- **Nginx** reverse proxy with security headers
- **MongoDB** with proper indexing

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB (if running locally)
- Judge0 API key (RapidAPI)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd algonix
   ```

2. **Configure environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost
   - API: http://localhost/api
   - MongoDB: localhost:27017

### Local Development Setup

1. **Install dependencies**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Configure your MongoDB URI, JWT secret, and Judge0 API key
   ```

3. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   
   # Or use local MongoDB installation
   mongod
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔧 Configuration

### Environment Variables

Create `backend/.env` with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/algonix
JWT_SECRET=your_super_secret_jwt_key
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
RAPIDAPI_KEY=your_rapidapi_key_here
NODE_ENV=development
```

### Judge0 API Setup

1. Sign up at [RapidAPI](https://rapidapi.com/)
2. Subscribe to [Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce/)
3. Get your API key and add it to the environment variables

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Integration Testing
```bash
npm run test:integration
```

## 📊 Database Schema

### Collections
- **users**: User profiles, stats, badges, certificates
- **challenges**: Problem statements, test cases, starter code
- **submissions**: Code submissions and results

### Key Indexes
- Users: email, username, totalPoints, weeklyPoints
- Challenges: difficulty, isActive, order
- Submissions: user, challenge, createdAt

## 🚀 Deployment

### Production Deployment

1. **Build and deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Set up SSL certificates**
   ```bash
   # Place SSL certificates in ./ssl/ directory
   # Update nginx.conf for HTTPS configuration
   ```

3. **Configure domain and DNS**
   - Point your domain to the server IP
   - Update nginx.conf with your domain name

### Cloud Deployment Options

#### AWS Deployment
- **ECS**: Use the provided Dockerfile
- **EC2**: Deploy using Docker Compose
- **DocumentDB**: For managed MongoDB
- **CloudFront**: For CDN and SSL

#### Google Cloud Platform
- **Cloud Run**: Containerized deployment
- **GKE**: Kubernetes deployment
- **Cloud MongoDB**: Managed database

#### Azure
- **Container Instances**: Quick deployment
- **AKS**: Kubernetes orchestration
- **Cosmos DB**: MongoDB-compatible database

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Security headers via Nginx
- Sandboxed code execution

## 📈 Performance Optimizations

- Database indexing for fast queries
- Code splitting in React frontend
- Gzip compression via Nginx
- Efficient MongoDB aggregation pipelines
- Caching strategies for leaderboards
- Optimized Docker images

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Challenge Endpoints
- `GET /api/challenges` - Get all challenges
- `GET /api/challenges/:id` - Get single challenge
- `POST /api/challenges/skill-test` - Get skill test
- `POST /api/challenges/skill-test/submit` - Submit skill test

### Submission Endpoints
- `POST /api/submissions` - Submit solution
- `GET /api/submissions/my-submissions` - Get user submissions
- `GET /api/submissions/:id` - Get submission details

### Leaderboard Endpoints
- `GET /api/leaderboard/weekly` - Weekly leaderboard
- `GET /api/leaderboard/all-time` - All-time leaderboard
- `GET /api/leaderboard/around-me` - User's position

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Judge0 for code execution API
- Material-UI for React components
- Monaco Editor for code editing
- MongoDB for database solutions
- Docker for containerization

## 📞 Support

For support, email support@algonix.com or create an issue in the repository.

---

**Happy Coding! 🚀**