const { Sequelize } = require('sequelize');

// Support both DATABASE_URL (Render/Heroku) and individual variables (local)
let sequelize;

if (process.env.DATABASE_URL) {
  // Production: Use DATABASE_URL from Render or Supabase
  // Only enable SSL for remote databases (not localhost/127.0.0.1/Docker)
  const isLocalDatabase = process.env.DATABASE_URL.includes('localhost') || 
                          process.env.DATABASE_URL.includes('127.0.0.1') ||
                          process.env.DATABASE_URL.includes('@db:');
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: !isLocalDatabase ? {
        require: true,
        rejectUnauthorized: false // Required for Render/Supabase
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Local development: Use individual variables
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

module.exports = { sequelize };
