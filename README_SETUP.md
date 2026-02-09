# HSPT Vocabulary Flashcards - Full Stack App

Complete vocabulary learning application with Node.js backend, PostgreSQL database, and vanilla JavaScript frontend.

## 🎯 Features

### Frontend
- **Modern UI**: Purple/pink gradient design optimized for 12-13 year olds
- **Three Study Modes**: Practice (flip cards), Quiz (multiple choice), Typing (type answers)
- **Gamification**: XP system, levels, daily streaks, achievements
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Live Filtering**: Search words, filter by part of speech, shuffle deck

### Backend
- **Authentication**: Login/register with .edu email restriction
- **User Progress Tracking**: Knows/doesn't know words, answer history
- **Gamification Backend**: XP, levels, streaks, achievements synced to database
- **Admin Dashboard**: User management, vocabulary CRUD, CSV upload/download, analytics
- **Session Management**: Study session tracking with XP earnings

## 📦 Tech Stack

### Backend
- **Node.js** (v14+) + **Express** (4.18.2)
- **PostgreSQL** (v12+) with **Sequelize ORM** (6.35.2)
- **bcrypt** for password hashing
- **express-session** with PostgreSQL store
- **multer** for CSV uploads
- **csv-parse/csv-stringify** for CSV processing

### Frontend
- Vanilla JavaScript (ES6+)
- CSS3 with animations
- Fredoka + Poppins fonts

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm
- PostgreSQL 12+

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create `.env` file in root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vocab_app
DB_USER=postgres
DB_PASSWORD=postgres

# Server
PORT=3000
NODE_ENV=development

# Session (generate with: openssl rand -base64 32)
SESSION_SECRET=your_session_secret_here
```

### 3. Database Setup
```bash
# Create database
createdb vocab_app

# Or using PostgreSQL shell
psql -U postgres
CREATE DATABASE vocab_app;
\q

# Initialize tables
npm run init-db
```

### 4. Import Vocabulary
```bash
# Import vocabulary from CSV (676 words)
node server/scripts/importVocab.js
```

### 5. Create Admin User
```bash
# Interactive CLI to create first admin
npm run create-admin
```

Example:
```
Enter admin email: admin@school.edu
Enter admin password: SecurePassword123
✓ Admin created successfully!
```

### 6. Start Development Server
```bash
npm run dev
```

Server will start at: http://localhost:3000

### 7. Access the Application

- **Login Page**: http://localhost:3000/
- **Register**: http://localhost:3000/register.html
- **Flashcards App**: http://localhost:3000/app.html (requires login)
- **Admin Dashboard**: http://localhost:3000/admin.html (requires admin role)

## 📁 Project Structure

```
vocab/
├── server/
│   ├── config/
│   │   └── db.js                 # Sequelize connection
│   ├── models/
│   │   ├── index.js              # Model associations
│   │   ├── User.js               # User model
│   │   ├── Vocabulary.js         # Vocabulary words
│   │   ├── UserProgress.js       # Word progress
│   │   ├── StudySession.js       # Session tracking
│   │   └── UserGamification.js   # XP/levels/achievements
│   ├── routes/
│   │   ├── auth.js               # Login/register/logout
│   │   ├── vocab.js              # Vocabulary endpoints
│   │   ├── progress.js           # Progress tracking
│   │   └── admin.js              # Admin CRUD operations
│   ├── middleware/
│   │   ├── auth.js               # Authentication check
│   │   └── admin.js              # Admin role check
│   ├── scripts/
│   │   ├── initDb.js             # Create database tables
│   │   ├── createAdmin.js        # Create admin user
│   │   └── importVocab.js        # Import CSV vocabulary
│   └── index.js                  # Express server entry
├── client/
│   └── public/
│       ├── css/
│       │   └── styles.css        # All app styles
│       ├── js/
│       │   ├── auth.js           # Login/register logic
│       │   ├── app.js            # Flashcards logic
│       │   └── admin.js          # Admin dashboard logic
│       ├── index.html            # Login page
│       ├── register.html         # Registration page
│       ├── app.html              # Flashcards interface
│       └── admin.html            # Admin dashboard
├── vocabulary.csv                # Source vocabulary (676 words)
├── package.json
├── .env
└── README_BACKEND.md
```

## 🗄️ Database Schema

### Users
- `id`, `email`, `password` (bcrypt), `role` (student/admin), `isEduVerified`, `lastLogin`

### Vocabulary
- `id`, `word`, `partOfSpeech`, `definition`
- Unique constraint: (word, partOfSpeech)

### UserProgress
- `userId`, `vocabId`, `isKnown`, `reviewCount`, `correctCount`, `incorrectCount`

### StudySession
- `id`, `userId`, `startedAt`, `endedAt`, `xpEarned`, `mode`

### UserGamification
- `userId`, `totalXp`, `level`, `dailyStreak`, `lastVisitDate`, `unlockedAchievements` (JSONB)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (.edu required)
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user + gamification

### Vocabulary
- `GET /api/vocab` - Get all vocabulary words

### Progress
- `GET /api/progress` - Get user's word progress
- `POST /api/progress/answer` - Submit answer (updates progress, awards XP)
- `GET /api/progress/gamification` - Get user's XP/level/streak
- `POST /api/progress/session-start` - Start study session
- `POST /api/progress/session-end` - End study session

### Admin (requires admin role)
- **Users**: `GET/POST/PUT/DELETE /api/admin/users/:id`
- **Vocabulary**: `GET/POST/PUT/DELETE /api/admin/vocab/:id`
- **CSV**: `POST /api/admin/vocab/upload`, `GET /api/admin/vocab/download`
- **Analytics**: `GET /api/admin/stats` (users, vocab, leaderboards)

## 📝 NPM Scripts

```json
{
  "start": "node server/index.js",           // Production
  "dev": "nodemon server/index.js",          // Development with auto-reload
  "init-db": "node server/scripts/initDb.js",  // Create tables
  "create-admin": "node server/scripts/createAdmin.js"  // Create admin user
}
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with 10 rounds
- **Session Management**: PostgreSQL-backed sessions with 30-day expiry
- **CORS Protection**: Configured for development/production
- **Email Validation**: .edu restriction for registration
- **Role-Based Access**: Admin routes protected by middleware
- **HTTP-Only Cookies**: Prevents XSS attacks

## 🎮 User Flow

### Student Flow
1. Register with .edu email → Creates student account
2. Login → Redirects to flashcards (/app.html)
3. Study vocabulary → Earn XP, level up, maintain streak
4. Answer questions → Progress synced to database
5. View achievements → Modal shows unlocked achievements
6. Logout → Session destroyed

### Admin Flow
1. Login with admin account → Redirects to dashboard (/admin.html)
2. **Overview Tab**: View stats, leaderboards
3. **Users Tab**: Search, add, delete users
4. **Vocabulary Tab**: Upload CSV, add/edit/delete words, download CSV
5. **Analytics Tab**: View platform-wide statistics

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Register with .edu email → Success
- [ ] Register with non-.edu → Error message
- [ ] Login with correct credentials → Redirects to /app.html
- [ ] Login with wrong password → Error message
- [ ] Access /app.html without login → Redirects to /index.html
- [ ] Access /admin.html as student → Redirects to /app.html
- [ ] Logout → Clears session, redirects to /index.html

#### Flashcards
- [ ] Cards load from database
- [ ] Flip card works (Practice mode)
- [ ] Quiz mode shows 4 choices
- [ ] Correct answer → XP updates, green feedback
- [ ] Wrong answer → Red feedback, streak resets
- [ ] Typing mode checks spelling
- [ ] Search filters words
- [ ] Part of speech filters work
- [ ] Shuffle randomizes deck
- [ ] "I know it" marks word as known
- [ ] Progress bar updates

#### Gamification
- [ ] XP bar fills correctly
- [ ] Level up triggers at threshold
- [ ] Daily streak increments on consecutive days
- [ ] Achievements unlock when criteria met
- [ ] Session stats display correctly

#### Admin Dashboard
- [ ] Stats load correctly
- [ ] User table displays all users
- [ ] Search users works
- [ ] Add user creates account
- [ ] Delete user removes from database
- [ ] Vocabulary table shows all words
- [ ] CSV upload imports words
- [ ] CSV download works
- [ ] Analytics tab shows correct metrics

## 📊 Database Queries

### Check user count
```sql
SELECT COUNT(*) FROM "Users";
```

### View top students
```sql
SELECT u.email, ug."totalXp", ug.level, ug."dailyStreak"
FROM "Users" u
JOIN "UserGamifications" ug ON u.id = ug."userId"
ORDER BY ug."totalXp" DESC
LIMIT 10;
```

### View vocabulary count
```sql
SELECT COUNT(*) FROM "Vocabularies";
```

### View user progress
```sql
SELECT u.email, COUNT(up.id) as words_known
FROM "Users" u
LEFT JOIN "UserProgresses" up ON u.id = up."userId" AND up."isKnown" = true
GROUP BY u.id, u.email;
```

## 🚀 Production Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=vocab_app
DB_USER=your_db_user
DB_PASSWORD=strong_password
SESSION_SECRET=strong_random_secret
PORT=3000
```

### Deployment Steps
1. Set `NODE_ENV=production`
2. Use strong `SESSION_SECRET` (generate with `openssl rand -base64 32`)
3. Configure PostgreSQL for production
4. Set `cookie.secure = true` (requires HTTPS)
5. Add rate limiting (express-rate-limit)
6. Enable compression (compression middleware)
7. Set up reverse proxy (nginx)
8. Configure SSL/TLS certificates

### Recommended Production Setup
```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server/index.js --name vocab-app

# Enable auto-restart on system reboot
pm2 startup
pm2 save
```

## 🐛 Troubleshooting

### Database connection fails
- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep vocab_app`
- Check credentials in `.env`

### Session table missing
- Run: `npm run init-db`
- Session table created automatically on first session

### CSV upload fails
- Check file format: `word,part_of_speech,definition`
- Ensure headers match exactly
- Remove quotes if present

### Admin can't access dashboard
- Verify role in database: `SELECT email, role FROM "Users";`
- Update role: `UPDATE "Users" SET role = 'admin' WHERE email = 'admin@school.edu';`

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize ORM](https://sequelize.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - Feel free to use this project for learning or production!

## 🎉 Acknowledgments

- HSPT vocabulary list source
- Fredoka and Poppins fonts (Google Fonts)
- Express.js and Sequelize communities

---

**Built with ❤️ for students preparing for the HSPT exam**
