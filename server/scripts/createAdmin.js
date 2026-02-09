require('dotenv').config();
const readline = require('readline');
const { User, UserGamification } = require('../models');
const { sequelize } = require('../config/db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✓ Connected to database\n');
    
    const email = await question('Admin email: ');
    const password = await question('Admin password: ');
    
    if (!email || !password) {
      console.error('Email and password required');
      process.exit(1);
    }
    
    if (password.length < 8) {
      console.error('Password must be at least 8 characters');
      process.exit(1);
    }
    
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    
    if (existingUser) {
      console.log('\nUser already exists. Updating role to admin...');
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('✓ User role updated to admin');
    } else {
      console.log('\nCreating new admin user...');
      const user = await User.create({
        email: email.toLowerCase(),
        password,
        role: 'admin',
        registrationSource: 'admin'
      });
      
      await UserGamification.create({ userId: user.id });
      console.log('✓ Admin user created successfully');
    }
    
    console.log('\nYou can now log in with:');
    console.log(`Email: ${email.toLowerCase()}`);
    console.log('Password: [the password you entered]');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin:', error);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
