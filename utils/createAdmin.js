const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function createAdminUser(username, password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = new User({
      username,
      password: hashedPassword,
      isAdmin: true
    });
    await adminUser.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Failed to create admin:', error);
  }
}

module.exports = createAdminUser;