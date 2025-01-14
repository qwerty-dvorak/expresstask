require('dotenv').config();
const mongoose = require('mongoose');
const createAdminUser = require('../utils/createAdmin');

async function init() {
  await mongoose.connect(process.env.MONGODB_URI);
  await createAdminUser('admin', process.env.ADMIN_PASSWORD);
  await mongoose.disconnect();
}

init().catch(console.error);