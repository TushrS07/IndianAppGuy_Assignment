import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

console.log("------ SMTP DEBUG CHECK ------");
console.log("SMTP_HOST:", JSON.stringify(process.env.SMTP_HOST));
console.log("EMAIL:", JSON.stringify(process.env.EMAIL));
console.log("PASSWORD exists:", !!process.env.PASSWORD);
console.log("------------------------------");


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },
  logger: true,
  debug: true
});

export default transporter;
