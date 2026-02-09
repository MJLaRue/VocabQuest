# HSPT Vocabulary Flashcards

A full-stack vocabulary learning application with gamification, user management, and admin dashboard.

## Features

- **Student Features:**
  - Interactive flashcard practice with 3 modes (Practice, Quiz, Typing)
  - XP and leveling system
  - Daily streak tracking
  - Achievement badges
  - Progress persistence across sessions
  - 676 HSPT vocabulary words

- **Admin Features:**
  - User management (view, create, edit, delete)
  - Vocabulary management (CRUD operations)
  - Bulk CSV upload/download
  - Usage analytics dashboard
  - Leaderboards

## Tech Stack

- **Backend:** Node.js, Express, PostgreSQL, Sequelize
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Session Management:** express-session with PostgreSQL store
- **Authentication:** bcrypt password hashing

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb vocab_app
```

Or using psql:

```sql
CREATE DATABASE vocab_app;
```

### 3. Environment Configuration

Copy the example environment file and update with your settings:

```bash
cp .env.example .env
```

Edit `.env` and update the database credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vocab_app
DB_USER=your_username
DB_PASSWORD=your_password
SESSION_SECRET=your_random_secret_key_here
```

### 4. Initialize Database

Run the database initialization script:

```bash
npm run init-db
```

This creates all necessary tables.

### 5. Import Vocabulary

Import the vocabulary.csv into the database:

```bash
node server/scripts/importVocab.js
```

### 6. Create Admin User

Create your first admin account:

```bash
npm run create-admin
```

Follow the prompts to enter admin email and password.

## Running the Application

### Development Mode

```bash
npm run dev
```

Server runs on http://localhost:3000 with auto-restart on file changes.

### Production Mode

```bash
npm start
```

## Usage

### For Students

1. Visit http://localhost:3000
2. Register with a `.edu` email address
3. Login and start learning!

### For Admins

1. Login with admin credentials
2. Visit http://localhost:3000/admin.html
3. Manage users, vocabulary, and view analytics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Vocabulary
- `GET /api/vocab` - Get all vocabulary

### Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress/answer` - Submit answer
- `GET /api/progress/gamification` - Get gamification data
- `POST /api/progress/session-start` - Start study session
- `POST /api/progress/session-end` - End study session

### Admin (requires admin role)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/vocab` - Get all vocabulary
- `POST /api/admin/vocab` - Create vocabulary word
- `POST /api/admin/vocab/upload` - Upload CSV
- `GET /api/admin/vocab/download` - Download CSV
- `PUT /api/admin/vocab/:id` - Update vocabulary word
- `DELETE /api/admin/vocab/:id` - Delete vocabulary word
- `GET /api/admin/stats` - Get dashboard statistics

## Database Schema

### Users
- id, email, password (hashed), role (student/admin)
- isEduVerified, registrationSource, lastLogin
- timestamps (created_at, updated_at)

### Vocabulary
- id, word, partOfSpeech, definition, createdBy
- unique constraint on (word, partOfSpeech)

### UserProgress
- id, userId, vocabId, isKnown
- reviewCount, correctCount, incorrectCount, lastReviewed
- unique constraint on (userId, vocabId)

### StudySession
- id, userId, startedAt, endedAt
- xpEarned, cardsReviewed, correctAnswers, mode

### UserGamification
- id, userId (unique), totalXp, level
- dailyStreak, lastVisitDate, unlockedAchievements (JSON)

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run init-db` - Initialize database schema
- `npm run create-admin` - Create admin user
- `node server/scripts/importVocab.js` - Import vocabulary from CSV

## Security

- Passwords hashed with bcrypt (10 rounds)
- Session-based authentication with httpOnly cookies
- CSRF protection through same-origin policy
- SQL injection prevented by Sequelize parameterized queries
- Registration restricted to .edu emails (unless admin-added)

## License

MIT
