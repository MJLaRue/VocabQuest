#!/bin/sh
# Smart seed script - only seeds if database is empty

# Run migrations first
npm run migrate

# Check if vocabulary table has data
VOCAB_COUNT=$(node -e "
const { Vocabulary } = require('./server/models');
const { sequelize } = require('./server/config/db');

(async () => {
  try {
    await sequelize.authenticate();
    const count = await Vocabulary.count();
    console.log(count);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
" 2>/dev/null)

if [ "$VOCAB_COUNT" = "0" ]; then
  echo "📚 Database is empty, importing vocabulary..."
  node server/scripts/importVocab.js
else
  echo "✓ Vocabulary already loaded ($VOCAB_COUNT words), skipping import"
fi

# Check if admin exists or should create one
ADMIN_EXISTS=$(node -e "
const { User } = require('./server/models');
const { sequelize } = require('./server/config/db');

(async () => {
  try {
    await sequelize.authenticate();
    const admin = await User.findOne({ where: { role: 'admin' } });
    console.log(admin ? 'yes' : 'no');
    process.exit(0);
  } catch (error) {
    console.log('no');
    process.exit(0);
  }
})();
" 2>/dev/null)

if [ "$ADMIN_EXISTS" = "no" ] && [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo "👤 Creating admin user..."
  node server/scripts/createAdmin.js
else
  echo "✓ Admin user already exists or credentials not set, skipping admin creation"
fi

# Run the passed command (usually npm start or npm run dev)
exec "$@"
