# Microservices Docker Setup

This Docker setup allows you to run all 7 microservices with a single command. Perfect for frontend developers who want to avoid running multiple services locally.

## 📋 Prerequisites

1. **Docker Desktop** installed ([Download here](https://www.docker.com/products/docker-desktop))
2. **PostgreSQL** running locally on your machine with the `club_user` database
3. Your existing data in PostgreSQL (we'll connect to it from Docker)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     API Gateway (8080)                  │
│                    (Entry Point)                        │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
    ┌─────▼─────┐       ┌──────▼──────┐
    │  Eureka   │       │  Services   │
    │  (8761)   │       │             │
    └───────────┘       │ - User (8081)
                        │ - Profile (8082)
                        │ - Club (8083)
                        │ - Independent (8085)
                        │ - Event (8086)
                        └─────────────┘
                                │
                        ┌───────▼────────┐
                        │   PostgreSQL   │
                        │  (Your Local)  │
                        └────────────────┘
```

## 🚀 Quick Start Guide

### Step 1: Project Structure

Organize your project like this:

```
your-project/
├── docker-compose.yml           # Main orchestration file
├── .env                         # Your environment variables (create from .env.example)
├── .env.example                 # Template for environment variables
├── .gitignore                   # Prevent committing sensitive files
│
├── eureka/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│
├── api-gateway/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│
├── user-service/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│
├── profile-management-service/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│
├── club-service/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│
├── independent-service/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│
└── event-service/
    ├── Dockerfile
    ├── pom.xml
    └── src/
```

### Step 2: Copy Dockerfiles

Copy the `Dockerfile` from each service folder in this setup to your corresponding service folders.

### Step 3: Setup Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:
   ```env
   DB_USER=postgres
   DB_PASS=your_password
   SECRET_KEY=your_jwt_secret_key_that_you_currently_use
   MAIL_USER=your_email@gmail.com
   MAIL_PASS=your_gmail_app_password
   ```

   **Important Notes:**
   - `SECRET_KEY` must match the one you're currently using in your services
   - `MAIL_PASS` should be a Gmail App Password, not your regular password
     - Go to: Google Account → Security → 2-Step Verification → App Passwords

### Step 4: Ensure PostgreSQL is Running

Make sure your local PostgreSQL is running with the `club_user` database:

```bash
# Check if PostgreSQL is running
# On Windows: Check Services
# On Mac: brew services list
# On Linux: sudo systemctl status postgresql

# Verify database exists
psql -U postgres -c "\l" | grep club_user
```

### Step 5: Start All Services

From the root directory (where `docker-compose.yml` is):

```bash
docker-compose up --build
```

**First time?** This will take 5-10 minutes as it:
- Downloads base Docker images
- Downloads all Maven dependencies
- Builds each service
- Starts everything in the correct order

### Step 6: Verify Everything is Running

1. **Check Eureka Dashboard:**
   - Open: http://localhost:8761
   - You should see all 6 services registered

2. **Check API Gateway:**
   - Open: http://localhost:8080/actuator/health
   - Should return: `{"status":"UP"}`

3. **Test an API endpoint:**
   ```bash
   # Example: Check if user service is accessible through gateway
   curl http://localhost:8080/api/auth/health
   ```

## 🎯 Usage

### Start Services
```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached mode)
docker-compose up -d
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove all containers, networks, and volumes
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service
docker-compose logs -f api-gateway
```

### Rebuild After Code Changes
```bash
# Rebuild specific service
docker-compose up --build user-service

# Rebuild everything
docker-compose up --build
```

### Check Service Status
```bash
docker-compose ps
```

## 📝 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Eureka Server | 8761 | http://localhost:8761 |
| API Gateway | 8080 | http://localhost:8080 |
| User Service | 8081 | http://localhost:8081 |
| Profile Service | 8082 | http://localhost:8082 |
| Club Service | 8083 | http://localhost:8083 |
| Independent Service | 8085 | http://localhost:8085 |
| Event Service | 8086 | http://localhost:8086 |

**Note:** Frontend should only talk to API Gateway (port 8080), not individual services.

## 🔧 Troubleshooting

### Problem: Services can't connect to PostgreSQL

**Solution:** Make sure you're using `host.docker.internal` in the connection URL. The docker-compose.yml already handles this, but if you see connection errors:

```yaml
# This is already set in docker-compose.yml
SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/club_user
```

### Problem: Eureka shows services as DOWN

**Wait 1-2 minutes.** Services take time to register with Eureka. If still DOWN after 2 minutes:

```bash
# Restart the problematic service
docker-compose restart user-service
```

### Problem: "Port already in use" error

**Solution:** Another process is using the port. Find and stop it:

```bash
# On Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess

# On Mac/Linux
lsof -i :8080
kill -9 <PID>

# Or change the port in docker-compose.yml
```

### Problem: Build is very slow

**Solution:** The first build is slow. Subsequent builds are much faster due to Docker caching. To speed up:

1. Make sure Docker Desktop has enough resources:
   - Settings → Resources → Increase CPU and Memory

2. Clear old containers and images:
   ```bash
   docker system prune -a
   ```

### Problem: Service won't start after code changes

**Solution:** Force rebuild:

```bash
# Remove old container and rebuild
docker-compose rm -f user-service
docker-compose up --build user-service
```

## 💡 Tips for Frontend Developers

1. **Single Command:** Just run `docker-compose up -d` and everything starts in the background.

2. **API Endpoint:** Always use `http://localhost:8080/api/...` (API Gateway), never direct service URLs.

3. **Environment Variables:** Never commit the `.env` file. Each developer should have their own.

4. **Stopping Services:** `Ctrl+C` if running in foreground, or `docker-compose down` if in background.

5. **Fresh Start:** If something is broken, try:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

6. **Check Logs:** If something isn't working:
   ```bash
   docker-compose logs -f
   ```

## 🔒 Security Notes

- **Never commit `.env` file** - It contains sensitive credentials
- **Keep `.gitignore` updated** - Already configured to ignore `.env`
- **Use App Passwords** - For Gmail, use App Passwords, not your main password
- **Secret Key** - Use a long, random string for `SECRET_KEY`

## 📦 What Gets Built

Each Dockerfile uses **multi-stage builds**:

1. **Build Stage:** Compiles Java code using Maven
2. **Runtime Stage:** Runs the compiled JAR in a lightweight JRE image

This keeps the final images small and efficient.

## 🆘 Need Help?

1. Check the logs: `docker-compose logs -f [service-name]`
2. Verify PostgreSQL is running and accessible
3. Ensure `.env` file has correct values
4. Check Docker Desktop is running
5. Try a fresh start: `docker-compose down && docker-compose up --build`

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Cloud Netflix Eureka](https://spring.io/projects/spring-cloud-netflix)

---

**Happy Coding! 🚀**

If you encounter any issues, feel free to reach out to the backend team.
