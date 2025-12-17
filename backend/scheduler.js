const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Schedule = require('./models/Schedule'); 
const User = require('./models/User');         

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendReminders = async () => {
  console.log('⏰ Running Daily Workout Reminder Check...');

  try {
    // 1. Get the Start and End of "Today"
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 2. Find workouts falling within this time range
    const pendingSchedules = await Schedule.find({
      date: {
        $gte: startOfDay, // Greater than or equal to start of today
        $lte: endOfDay    // Less than or equal to end of today
      },
      isCompleted: false
    }).populate('user', 'name email');

    if (pendingSchedules.length === 0) {
      console.log('✅ No pending workouts found for today.');
      return;
    }

    console.log(`found ${pendingSchedules.length} users to remind.`);

    for (const schedule of pendingSchedules) {
      if (!schedule.user || !schedule.user.email) continue;

      const mailOptions = {
        from: `"FitTrack Coach" <${process.env.EMAIL_USER}>`,
        to: schedule.user.email,
        subject: `💪 Workout Reminder: ${schedule.workout.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563EB;">Hey ${schedule.user.name.split(' ')[0]}!</h2>
            <p>Don't forget to crush your goals today.</p>
            
            <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>📅 Today's Mission:</strong> ${schedule.workout.name}
            </div>

            <p>Log in to track your progress:</p>
            <a href="http://localhost:3000" style="background: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #888;">Keep pushing! - The FitTrack Team</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${schedule.user.email}`);
    }

  } catch (error) {
    console.error('❌ Error in reminder job:', error);
  }
};

const startScheduler = () => {
  // Currently set to run EVERY MINUTE for testing ('* * * * *')
  // Change back to ('0 9 * * *') when done testing
  cron.schedule('0 9 * * *', () => { 
    sendReminders();
  });
  
  console.log('📅 Reminder Scheduler is Active');
};

module.exports = startScheduler;