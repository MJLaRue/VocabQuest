require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { sequelize } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Validate required environment variables
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  console.error('ERROR: SESSION_SECRET must be set and at least 32 characters long');
  process.exit(1);
}

if (!process.env.DATABASE_URL && (!process.env.DB_NAME || !process.env.DB_USER)) {
  console.error('ERROR: Database configuration required');
  process.exit(1);
}

// Trust Render proxy (needed for secure cookies over HTTPS)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://r2cdn.perplexity.ai"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      workerSrc: ["'self'", "blob:"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 1000, // 10 in prod, 1000 in dev
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: process.env.NODE_ENV === 'production' ? 1000 : 1000, // 1000/min in prod and dev
  message: 'Too many requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
// In production, frontend and API are on same domain (no CORS needed)
// In development, allow localhost for testing
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
}
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
const sessionConnectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const isLocalDatabase = sessionConnectionString.includes('localhost') ||
  sessionConnectionString.includes('127.0.0.1') ||
  sessionConnectionString.includes('@db:');

const { Pool } = require('pg');
const sessionPool = new Pool({
  connectionString: sessionConnectionString,
  ssl: !isLocalDatabase ? { rejectUnauthorized: false } : false,
  // Keep-alive prevents stale connections after Render wake-ups
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  // Match Sequelize pool — release idle connections before Supabase drops them
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 10000
});

app.use(session({
  store: new pgSession({
    pool: sessionPool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure cookies in production (HTTPS)
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  },
  proxy: true // Always trust proxy if we're behind one (Render, etc)
}));

// Static files
// Serve built Svelte app from client-new/dist
// Use path from project root for more reliable deployment
const projectRoot = path.join(__dirname, '..');
const clientDistPath = path.join(projectRoot, 'client', 'dist');
const uploadsPath = path.join(projectRoot, 'uploads');

console.log('Server directory (__dirname):', __dirname);
console.log('Project root:', projectRoot);
console.log('Client dist path:', clientDistPath);
console.log('Client dist exists:', require('fs').existsSync(clientDistPath));
console.log('Index.html exists:', require('fs').existsSync(path.join(clientDistPath, 'index.html')));

app.use(express.static(clientDistPath));
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/vocab', apiLimiter, require('./routes/vocab'));
app.use('/api/progress', apiLimiter, require('./routes/progress'));
app.use('/api/admin', apiLimiter, require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - serve index.html for all non-API routes
// This allows client-side routing to work
app.get('*', (req, res) => {
  const indexPath = path.join(projectRoot, 'client', 'dist', 'index.html');
  res.sendFile(indexPath);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database sync and server start
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✓ Database models synchronized');
    }

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
