import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS starts after connection
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD, // App password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default transport;
