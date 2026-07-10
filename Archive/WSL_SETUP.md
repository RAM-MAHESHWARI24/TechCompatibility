# WSL Setup Guide

If you're running this project on **Windows Subsystem for Linux (WSL)**, follow these steps to avoid common failures.

## Pre-Flight Checklist

### 1. Docker Desktop on Windows
- [ ] Docker Desktop is installed and running on Windows
- [ ] NOT just Docker in WSL — must be Docker Desktop for Windows
- [ ] Test: `docker ps` should work in your WSL terminal

### 2. WSL2 Configuration (`.wslconfig`)
Create or edit `C:\Users\<YourUsername>\.wslconfig`:
```ini
[wsl2]
memory=4GB
processors=4
swap=2GB
```
Restart WSL after changes:
```bash
wsl --shutdown
```

### 3. File Permissions (Before Running Docker)
Run these commands in WSL terminal from the project root:
```bash
chmod +x backend/mvnw
chmod +x start.sh
```

### 4. Line Endings
Ensure scripts have Unix line endings (LF, not CRLF):
```bash
dos2unix start.sh backend/mvnw 2>/dev/null || echo "dos2unix not installed, but usually not needed with Docker"
```

### 5. Port Conflicts
Check if ports 80, 5173, 8080, 3306 are available:
```bash
netstat -an | grep LISTENING | grep -E "80|5173|8080|3306"
```
If ports are in use, either:
- Stop the conflicting service
- Change ports in `proxy/docker-compose.yml`

## Running on WSL

### Start Services
```bash
cd proxy
docker compose up
```

### Expected Startup Times (WSL is slower)
- MySQL: 20-40 seconds (WSL filesystem I/O)
- Backend: 30-60 seconds (Maven downloads + Spring Boot startup)
- Frontend: 10-20 seconds (npm install)

### Logs to Watch
If something fails:
```bash
docker compose logs frontend    # Check frontend startup
docker compose logs backend     # Check backend/Maven errors
docker compose logs pot-mysql   # Check MySQL errors
docker compose logs -f          # Follow all logs
```

## Common WSL Failures & Fixes

### Symptom: "Cannot connect to Docker daemon"
```bash
# Docker Desktop not running on Windows
# Fix: Start Docker Desktop from Windows
```

### Symptom: "pot-mysql: connection refused"
```bash
# MySQL not fully initialized yet
# Fix: It auto-retries. Wait 1-2 minutes and check logs:
docker compose logs pot-mysql
```

### Symptom: "npm EACCES: permission denied"
```bash
# npm can't write to node_modules in WSL volume
# Fix: Run in container instead:
docker exec -it <project>-frontend-1 npm install
```

### Symptom: "hot-reload not working" (code changes don't show up)
```bash
# WSL filesystem sync delay
# Already fixed with CHOKIDAR_USEPOLLING=true
# If still broken: try editing and saving again after 5 seconds
```

### Symptom: Backend can't find `./mvnw`
```bash
# Permissions lost during Windows/WSL file transfer
# Fix: Run in WSL terminal:
chmod +x backend/mvnw
docker compose restart backend
```

### Symptom: Docker runs out of memory
```bash
# WSL allocated memory limit
# Fix: Edit .wslconfig (see Pre-Flight Checklist section 2)
```

## Performance Tips for WSL

1. **Store project in WSL filesystem** (not `/mnt/c/...`)
   - Much faster than Windows filesystem access
   ```bash
   mkdir -p ~/projects
   # Move or clone project there
   ```

2. **Use `.dockerignore`** (if you create one)
   - Speeds up Docker builds by excluding unnecessary files

3. **Monitor resource usage**
   ```bash
   docker stats
   ```

4. **Clear Docker cache if builds are slow**
   ```bash
   docker builder prune
   ```

## Verify Everything Works

After `docker compose up`, test all endpoints:

```bash
# Frontend
curl http://localhost:5173

# Backend
curl http://localhost:8080/api/check

# Through Nginx proxy
curl http://localhost/
curl http://localhost/api/check

# Database
mysql -h 127.0.0.1 -u pot_user -p pot_pass -e "SELECT VERSION();"
```

## If All Else Fails

Clean restart:
```bash
docker compose down -v  # Remove all volumes (loses database data!)
docker system prune -a  # Clean all unused images
docker compose up       # Fresh start
```

---

**Questions?** Check `docker compose logs` output or look at the main README.md for general setup info.
