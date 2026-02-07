# Deployment Instructions

## 📋 Checklist for Team Distribution

### Step 1: Organize Your Repository

Place all the Docker files in your project root:

```
your-repository/
├── .env.example          ✅ Template for environment variables
├── .gitignore            ✅ Prevents committing sensitive files
├── docker-compose.yml    ✅ Main orchestration file
├── README.md             ✅ Main setup guide
├── DEVELOPMENT.md        ✅ Developer guide
├── start.sh              ✅ Quick start script (Mac/Linux)
├── start.bat             ✅ Quick start script (Windows)
│
├── eureka/
│   ├── Dockerfile        ✅ Add this
│   ├── pom.xml           (existing)
│   └── src/              (existing)
│
├── api-gateway/
│   ├── Dockerfile        ✅ Add this
│   ├── pom.xml           (existing)
│   └── src/              (existing)
│
├── user-service/
│   ├── Dockerfile        ✅ Add this
│   ├── pom.xml           (existing)
│   └── src/              (existing)
│
├── profile-management-service/
│   ├── Dockerfile        ✅ Add this
│   ├── pom.xml           (existing)
│   └── src/              (existing)
│
├── club-service/
│   ├── Dockerfile        ✅ Add this
│   ├── pom.xml           (existing)
│   └── src/              (existing)
│
├── independent-service/
│   ├── Dockerfile        ✅ Add this
│   ├── pom.xml           (existing)
│   └── src/              (existing)
│
└── event-service/
    ├── Dockerfile        ✅ Add this
    ├── pom.xml           (existing)
    └── src/              (existing)
```

### Step 2: Commit to Git

```bash
# Add all the new Docker files
git add .
git commit -m "Add Docker support for all microservices"
git push
```

### Step 3: Share Instructions with Frontend Team

Send them this message:

---

**📧 Message Template for Frontend Team:**

> Hi team! 👋
>
> We've just added Docker support to make running all our microservices super easy. No more manual service management!
>
> **What you need:**
> 1. Docker Desktop ([Download here](https://www.docker.com/products/docker-desktop))
> 2. PostgreSQL running locally (I'll share the credentials separately)
>
> **Setup (one-time):**
> ```bash
> # 1. Pull the latest code
> git pull
> 
> # 2. Create your .env file
> cp .env.example .env
> 
> # 3. I'll send you the credentials to put in the .env file
> ```
>
> **Running the backend (every time):**
> ```bash
> # Just run this one command:
> docker-compose up -d
> 
> # Wait 2 minutes, then check: http://localhost:8761
> # You should see all 6 services registered
> ```
>
> **Using the API:**
> - Always use: `http://localhost:8080/api/...`
> - Don't use individual service ports (8081, 8082, etc.)
>
> **Stopping:**
> ```bash
> docker-compose down
> ```
>
> Check the `README.md` for detailed instructions and troubleshooting!

---

### Step 4: Share Credentials Securely

**DON'T** send credentials via email or chat. Use a secure method:

1. **In-person:** Best option for local team
2. **Secure sharing tools:**
   - 1Password (if your company uses it)
   - Bitwarden Send
   - Encrypted email

Example .env content to share (securely):
```env
DB_USER=postgres
DB_PASS=actual_password_here
SECRET_KEY=actual_jwt_secret_here
MAIL_USER=team-email@gmail.com
MAIL_PASS=actual_app_password_here
```

### Step 5: Test Before Distribution

**YOU SHOULD TEST THIS FIRST!**

1. Fresh clone of your repository:
   ```bash
   cd /tmp
   git clone your-repository-url test-docker
   cd test-docker
   ```

2. Create .env file with real credentials

3. Test the setup:
   ```bash
   docker-compose up --build
   ```

4. Verify:
   - All services start without errors
   - Eureka shows 6 registered services
   - Can call API through gateway: `curl http://localhost:8080/api/auth/health`

5. Clean up:
   ```bash
   docker-compose down
   cd ..
   rm -rf test-docker
   ```

## 🎯 For Windows Users on Your Team

If team members are on Windows, they should:

1. **Install Docker Desktop for Windows**
   - Requires Windows 10/11 Pro/Enterprise with WSL 2
   - Or use Docker Toolbox for older Windows versions

2. **Use WSL 2** (recommended)
   - Better performance than Hyper-V
   - More Linux-like experience

3. **Use PowerShell or CMD**
   - Run `docker-compose up -d`
   - Or double-click `start.bat` for automatic startup

## 🎯 For Mac Users on Your Team

1. **Install Docker Desktop for Mac**
   - Works on both Intel and Apple Silicon

2. **Run from Terminal:**
   ```bash
   ./start.sh
   # Or manually:
   docker-compose up -d
   ```

## 🎯 For Linux Users on Your Team

1. **Install Docker and Docker Compose:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install docker.io docker-compose
   
   # Add user to docker group
   sudo usermod -aG docker $USER
   # Log out and back in
   ```

2. **Run:**
   ```bash
   ./start.sh
   # Or manually:
   docker-compose up -d
   ```

## 🔍 Post-Deployment Monitoring

After your team starts using Docker, monitor for:

### Common First-Time Issues

1. **Docker not installed properly**
   - Solution: Share Docker Desktop installation guide

2. **PostgreSQL not accessible**
   - They need PostgreSQL running locally
   - Share database dump: `pg_dump -U postgres -d club_user > db_dump.sql`

3. **Port conflicts**
   - Another service using 8080, 8761, etc.
   - Tell them to stop conflicting services

4. **Slow performance**
   - First build takes 5-10 minutes (this is normal)
   - Tell them to allocate more resources to Docker

### Health Check Script

Share this with your team for quick health checks:

```bash
#!/bin/bash
# health-check.sh

echo "Checking services..."

services=("eureka:8761" "api-gateway:8080" "user-service:8081" "profile-management-service:8082" "club-service:8083" "independent-service:8085" "event-service:8086")

for service in "${services[@]}"; do
    name="${service%%:*}"
    port="${service##*:}"
    
    if curl -s "http://localhost:$port/actuator/health" > /dev/null 2>&1; then
        echo "✅ $name is UP"
    else
        echo "❌ $name is DOWN"
    fi
done

echo ""
echo "Check Eureka Dashboard: http://localhost:8761"
```

## 📊 Success Metrics

You'll know the deployment is successful when:

- ✅ Frontend team can start all services with one command
- ✅ No more "service not running" bugs during development
- ✅ Frontend developers' machines aren't lagging anymore
- ✅ New team members can onboard in <30 minutes
- ✅ No more environment-specific bugs

## 🚨 Rollback Plan

If Docker setup causes issues:

1. **Keep the old setup documentation**
   - Don't delete instructions for running services manually

2. **Make Docker optional initially**
   - "Try Docker, but you can still run services manually"

3. **Gradual adoption**
   - Start with frontend team
   - Then other backend developers
   - Then make it the standard

## 📝 Update Documentation

After deploying, update your main project README:

```markdown
## Running the Backend

### Option 1: Docker (Recommended)
See [Docker Setup Guide](README.md)

### Option 2: Manual
See [Manual Setup Guide](MANUAL_SETUP.md)
```

## 🎓 Training Session (Optional)

Consider a quick 15-minute session with your team:

1. **Demo the setup** (5 min)
   - Show `docker-compose up`
   - Show Eureka dashboard
   - Make an API call

2. **Q&A** (5 min)
   - Answer questions
   - Address concerns

3. **Hands-on** (5 min)
   - Have them try it on their machines
   - Help with issues

## 📞 Support Plan

Designate 1-2 people as "Docker support" for the first week:

- Answer Docker-related questions
- Help debug issues
- Collect feedback for improvements

## 🔄 Continuous Improvement

After 1 week, collect feedback:

- What worked well?
- What was confusing?
- What took too long?
- Any performance issues?

Update documentation and setup based on feedback.

---

## Final Checklist Before Going Live

- [ ] Tested Docker setup on fresh clone
- [ ] Verified all services start correctly
- [ ] Updated .gitignore to exclude .env
- [ ] Created comprehensive README
- [ ] Prepared .env.example template
- [ ] Tested on Windows/Mac/Linux (if team uses multiple OSs)
- [ ] Database dump prepared for sharing
- [ ] Credentials ready to share securely
- [ ] Rollback plan documented
- [ ] Team communication prepared
- [ ] Support plan in place

---

**You're ready to go! 🚀**

Your frontend team is going to love this. No more running 7 different services manually!
