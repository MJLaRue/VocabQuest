# Docker Deployment Quick Start

## First Time Setup

1. **Configure environment variables:**
   ```bash
   cp .env.docker .env.docker.local
   ```
   
   Then edit `.env.docker.local` and change:
   - `ADMIN_EMAIL` - Your admin email address
   - `ADMIN_PASSWORD` - Secure password (min 8 characters)
   - `SESSION_SECRET` - Generate with: `openssl rand -hex 32`
   - `POSTGRES_PASSWORD` - Database password (change from default)

2. **Update docker-compose.yml** to use your local file:
   ```yaml
   env_file:
     - .env.docker.local  # Change from .env.docker
   ```

3. **Start the containers:**
   ```bash
   docker-compose up --build
   ```

The application will:
- ✅ Run database migrations
- ✅ Import vocabulary (only if database is empty)
- ✅ Create admin user (only if none exists)
- ✅ Start the server on http://localhost:3000

## Updating Admin Credentials

**Option 1: Before first run**
- Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.docker.local`

**Option 2: After deployment**
```bash
# Enter the running container
docker-compose exec app sh

# Create/update admin user
ADMIN_EMAIL=new@email.com ADMIN_PASSWORD=NewPass123! npm run create-admin

# Exit container
exit
```

## Clean Slate (Reset Database)

To start fresh:
```bash
docker-compose down -v  # Remove containers and volumes
docker-compose up --build  # Rebuild and start
```

## Viewing Logs

```bash
# All services
docker-compose logs -f

# Just the app
docker-compose logs -f app

# Just the database
docker-compose logs -f db
```

## Stopping

```bash
# Stop but keep data
docker-compose stop

# Stop and remove containers (keeps data volumes)
docker-compose down

# Stop and remove everything including data
docker-compose down -v
```

## Troubleshooting

**Admin creation fails:**
- Check that `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in `.env.docker.local`
- Verify the file is referenced in `docker-compose.yml` under `env_file`

**Database connection errors:**
- Wait 10-15 seconds for database to initialize
- Check logs: `docker-compose logs db`

**Duplicate key errors:**
- These are normal if vocabulary already exists
- The import script skips existing words automatically

**Login redirects back to login:**
- Check that `SESSION_SECRET` is set in environment
- Verify cookies are working (try different browser)
