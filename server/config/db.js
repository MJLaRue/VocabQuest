const { Sequelize } = require('sequelize');

// Support both DATABASE_URL (Render/Heroku) and individual variables (local)
let sequelize;

if (process.env.DATABASE_URL) {
  // Production: Use DATABASE_URL from Render or Neon
  // Only enable SSL for remote databases (not localhost/127.0.0.1/Docker)
  const isLocalDatabase = process.env.DATABASE_URL.includes('localhost') ||
                          process.env.DATABASE_URL.includes('127.0.0.1') ||
                          process.env.DATABASE_URL.includes('@db:');

  // Strip sslmode/channel_binding params from the URL — pg-connection-string
  // emits a security warning for sslmode=require in newer versions. SSL is
  // handled explicitly via dialectOptions.ssl below instead.
  const dbUrl = new URL(process.env.DATABASE_URL);
  dbUrl.searchParams.delete('sslmode');
  dbUrl.searchParams.delete('channel_binding');

  sequelize = new Sequelize(dbUrl.toString(), {
    dialect: 'postgres',
    logging: false,
    schema: 'public',
    dialectOptions: {
      ssl: !isLocalDatabase ? {
        require: true,
        rejectUnauthorized: false // Required for Neon/Render
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });

  // Neon's transaction pooler (PgBouncer) blocks search_path as a startup
  // parameter, so we set it via a query after each connection is established.
  sequelize.afterConnect(async (connection) => {
    await connection.query('SET search_path TO public;');
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
      logging: false, // Disable query logging
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
