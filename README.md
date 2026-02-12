# VocabQuest - HSPT Vocabulary Flashcards

A full-stack, gamified vocabulary learning application built with Svelte, Node.js, and PostgreSQL.

## 🚀 Features

- **Interactive Learning**: Practice, Quiz, and Typing modes.
- **Gamification**: XP system, levels, daily streaks, and achievements.
- **Admin Dashboard**: Manage users and vocabulary, upload CSVs, and view stats.
- **Modern Tech Stack**: Svelte frontend, Express backend, Sequelize ORM.

## 🛠️ Development Setup

### Option 1: Local Development (Recommended for Frontend Work)

Best for active frontend development with hot module reloading:

1. **Setup Environment Variables**:
   ```bash
   cp .env.example .env
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Start PostgreSQL** (via Docker or local install):
   ```bash
   # Using Docker for just the database:
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=vocab_app postgres:14-alpine
   ```

4. **Run Development Servers**:
   ```bash
   npm run dev
   ```
   - **Frontend**: http://localhost:3000 (Vite with HMR)
   - **Backend**: http://localhost:3001 (Express with auto-reload)

### Option 2: Docker Compose (Full Stack)

Good for testing the full production-like environment:

1. **Setup Environment**:
   ```bash
   cp .env.example .env.docker
   ```

2. **Build the Client** (must be done on host due to architecture issues):
   ```bash
   cd client && npm install && npm run build && cd ..
   ```

3. **Start Docker**:
   ```bash
   docker-compose up
   ```
   - **Application**: http://localhost:3000 (serves pre-built client)
   - **Database**: PostgreSQL on port 5432

> **Note**: The Docker setup serves the pre-built client. For active frontend development with hot reloading, use Option 1.

## 📦 Building for Production

```bash
npm run build
```

This builds the Svelte app to `client/dist/` which is served by the Express backend.

## 🚀 Deployment (Render)

This project is configured for easy deployment on Render:

- **Build Command**: Defined in `render.yaml`
- **Start Command**: `npm start`
- **Frontend**: Served as static files from `client/dist`

## 📁 Project Structure

- `client/`: Svelte frontend
- `server/`: Express backend and API
- `server/models/`: Sequelize database models
- `server/scripts/`: Migration and seeding scripts
- `vocabulary.csv`: Source vocabulary data

## 📄 License

MIT
