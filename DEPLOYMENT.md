# Algonix Deployment Guide

This guide provides step-by-step instructions for deploying the Algonix platform in various environments.

## 🚀 Quick Deployment (Recommended)

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

### One-Command Deployment

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

The script will:
1. Check system requirements
2. Create necessary directories
3. Set up environment configuration
4. Build and start all services
5. Initialize the database with sample data

## 🔧 Manual Deployment

### Step 1: Environment Configuration

1. **Copy environment template**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Configure environment variables**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://admin:password123@mongodb:27017/algonix?authSource=admin
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   PISTON_URL=https://emkc.org/api/v2/piston/execute
   NODE_ENV=production
   ```

> The backend uses Piston for code execution. If public access is restricted, set `PISTON_URL` to your self-hosted Piston endpoint.

### Step 3: Start Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 4: Verify Deployment

1. **Check application health**
   ```bash
   curl http://localhost/health
   ```

2. **Access the application**
   - Frontend: http://localhost
   - API: http://localhost/api
   - MongoDB: localhost:27017

## 🌐 Production Deployment

### SSL Configuration

1. **Obtain SSL certificates**
   ```bash
   # Using Let's Encrypt (recommended)
   certbot certonly --standalone -d yourdomain.com
   
   # Copy certificates
   cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
   cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
   ```

2. **Update nginx configuration**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /etc/nginx/ssl/fullchain.pem;
       ssl_certificate_key /etc/nginx/ssl/privkey.pem;
       
       # ... rest of configuration
   }
   ```

### Domain Configuration

1. **Update docker-compose.yml**
   ```yaml
   services:
     nginx:
       environment:
         - DOMAIN=yourdomain.com
   ```

2. **Configure DNS**
   - Point your domain A record to server IP
   - Add CNAME for www subdomain

### Security Hardening

1. **Change default passwords**
   ```bash
   # Update MongoDB credentials
   # Update JWT secret
   # Create admin user with strong password
   ```

2. **Configure firewall**
   ```bash
   # Allow only necessary ports
   ufw allow 80
   ufw allow 443
   ufw allow 22
   ufw enable
   ```

## ☁️ Cloud Deployment

### AWS Deployment

#### Using ECS (Recommended)

1. **Create ECS cluster**
   ```bash
   aws ecs create-cluster --cluster-name algonix-cluster
   ```

2. **Build and push Docker image**
   ```bash
   # Build image
   docker build -t algonix .
   
   # Tag for ECR
   docker tag algonix:latest 123456789.dkr.ecr.region.amazonaws.com/algonix:latest
   
   # Push to ECR
   docker push 123456789.dkr.region.amazonaws.com/algonix:latest
   ```

3. **Create task definition**
   ```json
   {
     "family": "algonix-task",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "1024",
     "memory": "2048",
     "containerDefinitions": [
       {
         "name": "algonix",
         "image": "123456789.dkr.ecr.region.amazonaws.com/algonix:latest",
         "portMappings": [
           {
             "containerPort": 5000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "MONGODB_URI",
             "value": "your-documentdb-connection-string"
           }
         ]
       }
     ]
   }
   ```

#### Using EC2

1. **Launch EC2 instance**
   - Choose Ubuntu 20.04 LTS
   - t3.medium or larger
   - Configure security groups (ports 80, 443, 22)

2. **Install Docker**
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo usermod -aG docker ubuntu
   ```

3. **Deploy application**
   ```bash
   git clone <repository-url>
   cd algonix
   ./deploy.sh
   ```

### Google Cloud Platform

#### Using Cloud Run

1. **Build and push to Container Registry**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/algonix
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy algonix \
     --image gcr.io/PROJECT-ID/algonix \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### Azure Deployment

#### Using Container Instances

1. **Create resource group**
   ```bash
   az group create --name algonix-rg --location eastus
   ```

2. **Deploy container**
   ```bash
   az container create \
     --resource-group algonix-rg \
     --name algonix \
     --image algonix:latest \
     --dns-name-label algonix-app \
     --ports 5000
   ```

## 🔍 Monitoring & Maintenance

### Health Checks

1. **Application health**
   ```bash
   curl http://localhost/health
   ```

2. **Database health**
   ```bash
   docker-compose exec mongodb mongo --eval "db.adminCommand('ping')"
   ```

3. **Service status**
   ```bash
   docker-compose ps
   ```

### Log Management

1. **View application logs**
   ```bash
   docker-compose logs -f app
   ```

2. **View database logs**
   ```bash
   docker-compose logs -f mongodb
   ```

3. **Export logs**
   ```bash
   docker-compose logs --no-color > algonix-logs.txt
   ```

### Backup & Recovery

1. **Database backup**
   ```bash
   docker-compose exec mongodb mongodump --out /backup
   docker cp $(docker-compose ps -q mongodb):/backup ./backup
   ```

2. **Database restore**
   ```bash
   docker cp ./backup $(docker-compose ps -q mongodb):/backup
   docker-compose exec mongodb mongorestore /backup
   ```

### Updates & Scaling

1. **Update application**
   ```bash
   git pull
   docker-compose build --no-cache
   docker-compose up -d
   ```

2. **Scale services**
   ```bash
   docker-compose up -d --scale app=3
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   sudo lsof -i :80
   
   # Kill the process or change port in docker-compose.yml
   ```

2. **MongoDB connection failed**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Verify connection string in .env
   ```

3. **Code execution errors**
   ```bash
   # Check backend logs for remote execution failures
   # Verify submitted code is properly formatted and uses a supported language
   # Retry later if the Piston service is temporarily unavailable
   ```

4. **Frontend build errors**
   ```bash
   # Clear npm cache
   docker-compose exec app npm cache clean --force
   
   # Rebuild frontend
   docker-compose build --no-cache frontend
   ```

### Performance Issues

1. **Slow database queries**
   ```bash
   # Check database indexes
   docker-compose exec mongodb mongo algonix --eval "db.users.getIndexes()"
   ```

2. **High memory usage**
   ```bash
   # Monitor container resources
   docker stats
   
   # Increase memory limits in docker-compose.yml
   ```

### Security Issues

1. **Update dependencies**
   ```bash
   npm audit fix
   docker-compose build --no-cache
   ```

2. **Check for vulnerabilities**
   ```bash
   docker scan algonix:latest
   ```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review application logs
3. Create an issue in the repository
4. Contact support at support@algonix.com

---

**Happy Deploying! 🚀**