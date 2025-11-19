const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false, // or true if you use port 465
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },
  logger: true,   // logs to console
  debug: true      // include SMTP traffic
});
