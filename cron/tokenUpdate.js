const cron = require('cron');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

const tokenUpdateJob = new cron.CronJob('1 * * * * *', async () => {
  try {
    const users = await User.find({});
    
    const updatePromises = users.map(user => {
      const oldToken = user.token;
      const newToken = uuidv4();
      
      return User.findByIdAndUpdate(user._id, {
        token: newToken,
        lastTokenUpdate: new Date()
      }).then(() => {
        console.log(`Token updated for user ${user.username}:`);
        console.log('Old token:', oldToken);
        console.log('New token:', newToken);
      });
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Token update error:', error);
  }
});

module.exports = tokenUpdateJob;