# Development Guide

## For Backend Developers

### Making Changes to Your Service

1. **Edit your code** in your service directory (e.g., `user-service/src/...`)

2. **Rebuild and restart** just that service:
   ```bash
   docker-compose up --build user-service
   ```

3. **Alternative:** Stop all services, rebuild everything:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

### Testing Individual Services

You can still run services individually outside Docker for debugging:

```bash
# Navigate to your service
cd user-service

# Run with Maven
mvn spring-boot:run

# Or if you have the JAR built
java -jar target/user-service-0.0.1-SNAPSHOT.jar
```

**Note:** Make sure Eureka is running (either in Docker or locally) when testing individual services.

### Adding a New Service

1. Create a new directory for your service
2. Copy the `Dockerfile` from any existing service and adjust the port
3. Add the service to `docker-compose.yml`:

```yaml
new-service:
  build:
    context: ./new-service
    dockerfile: Dockerfile
  container_name: new-service
  ports:
    - "8087:8087"  # Choose an available port
  environment:
    - DB_URL=jdbc:postgresql://host.docker.internal:5432/club_user
    - DB_USER=${DB_USER}
    - DB_PASS=${DB_PASS}
    - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka:8761/eureka/
  networks:
    - microservices-network
  depends_on:
    eureka:
      condition: service_healthy
  extra_hosts:
    - "host.docker.internal:host-gateway"
  restart: unless-stopped
```

4. Add routes in API Gateway configuration

### Debugging

#### View logs in real-time:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service

# Last 100 lines
docker-compose logs --tail=100 user-service
```

#### Enter a running container:
```bash
docker exec -it user-service sh
```

#### Check environment variables in container:
```bash
docker exec user-service env
```

## For Frontend Developers

### Quick Commands

**Start everything:**
```bash
docker-compose up -d
```

**Stop everything:**
```bash
docker-compose down
```

**Check if services are ready:**
```bash
# Open Eureka Dashboard
# Browser: http://localhost:8761
# You should see all 6 services registered
```

### API Endpoints

**Always use API Gateway:** http://localhost:8080

Examples:
```bash
# Authentication (public)
POST http://localhost:8080/api/auth/register
POST http://localhost:8080/api/auth/login

# User Management (requires token)
GET http://localhost:8080/api/users/profile
PUT http://localhost:8080/api/users/update

# Profile Management (requires token)
GET http://localhost:8080/api/profiles/{userId}
PUT http://localhost:8080/api/profiles/{userId}

# Clubs (requires token)
GET http://localhost:8080/api/clubs
POST http://localhost:8080/api/clubs
GET http://localhost:8080/api/user-clubs/{userId}

# Events (requires token)
GET http://localhost:8080/api/events
POST http://localhost:8080/api/events
GET http://localhost:8080/api/enrollments/{eventId}

# Department (requires token)
GET http://localhost:8080/api/department
```

### Testing with Postman/Thunder Client

1. **Login first** to get a token:
   ```
   POST http://localhost:8080/api/auth/login
   Body: {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

2. **Copy the token** from the response

3. **Use the token** in subsequent requests:
   ```
   Header: Authorization: Bearer <your-token-here>
   ```

### Common Issues

#### "Cannot connect to backend"
- Make sure Docker is running: `docker-compose ps`
- Check if services are up: Open http://localhost:8761
- Check logs: `docker-compose logs -f api-gateway`

#### "CORS errors"
- API Gateway already has CORS configured
- Make sure you're using http://localhost:8080, not individual service ports

#### "Unauthorized" errors
- Make sure you're sending the Authorization header
- Check token format: `Bearer <token>`
- Token might be expired (24 hours expiration)

#### Services are slow
- First startup is slow (building images)
- Subsequent startups are much faster
- Give services 1-2 minutes to fully register with Eureka

## Environment Variables

### Required Variables (.env file)

```env
# Database (your local PostgreSQL)
DB_USER=postgres
DB_PASS=your_password

# JWT Secret (must match across all services)
SECRET_KEY=your_current_jwt_secret

# Email (for user-service password reset)
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_gmail_app_password
```

### Getting Gmail App Password

1. Go to Google Account → Security
2. Enable 2-Step Verification (if not already)
3. Go to "App passwords"
4. Generate a new app password
5. Use that password in `MAIL_PASS`

## Database

### Connecting to PostgreSQL

The services connect to your **local PostgreSQL** on your machine (not in Docker).

Connection string from inside Docker:
```
jdbc:postgresql://host.docker.internal:5432/club_user
```

Connection string from your machine:
```
jdbc:postgresql://localhost:5432/club_user
```

### Database Migrations

Services use Hibernate's `ddl-auto: update`, so:
- Tables are created automatically
- Schema changes are applied on startup
- **Your existing data is preserved**

### Backup Your Database (Recommended)

Before first run:
```bash
pg_dump -U postgres -d club_user > backup.sql
```

Restore if needed:
```bash
psql -U postgres -d club_user < backup.sql
```

## Performance Tips

### For Low-End Machines

If your machine is struggling:

1. **Reduce Docker resources:**
   - Docker Desktop → Settings → Resources
   - Set to 2 CPUs, 4GB RAM (minimum)

2. **Start services selectively:**
   ```bash
   # Only start what you need for your current work
   docker-compose up eureka api-gateway user-service
   ```

3. **Use detached mode:**
   ```bash
   docker-compose up -d
   # This runs in background and uses less resources
   ```

### For Better Performance

1. **Allocate more resources to Docker:**
   - Docker Desktop → Settings → Resources
   - Increase CPUs and Memory

2. **Use BuildKit for faster builds:**
   ```bash
   DOCKER_BUILDKIT=1 docker-compose build
   ```

3. **Clean up old containers/images:**
   ```bash
   docker system prune -a
   ```

## Git Workflow

### What to Commit

✅ **DO commit:**
- `docker-compose.yml`
- All `Dockerfile`s
- `.env.example`
- `.gitignore`
- `README.md`
- Source code (`src/` directories)
- `pom.xml` files

❌ **DON'T commit:**
- `.env` (contains secrets)
- `target/` (build artifacts)
- `.idea/`, `.vscode/` (IDE files)
- Any log files

### .gitignore is Pre-configured

The `.gitignore` file already excludes sensitive and unnecessary files.

## CI/CD Notes

For deployment to production:

1. **Don't use `host.docker.internal`** - Use actual database host
2. **Use secrets management** - Don't put credentials in docker-compose.yml
3. **Use specific image tags** - Don't use `latest`
4. **Enable health checks** - Already configured in docker-compose.yml
5. **Use orchestration** - Consider Kubernetes for production

## Useful Commands Cheat Sheet

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f user-service

# Check service status
docker-compose ps

# Restart a service
docker-compose restart user-service

# Remove all containers and volumes
docker-compose down -v

# Access container shell
docker exec -it user-service sh

# Check container resources
docker stats

# Clean up Docker system
docker system prune -a
```

## Getting Help

1. **Check logs first:** `docker-compose logs -f`
2. **Check Eureka:** http://localhost:8761
3. **Verify .env file:** Make sure all variables are set
4. **Try fresh start:** `docker-compose down && docker-compose up --build`
5. **Ask the team:** Share your logs when asking for help

---

Happy coding! 🚀
