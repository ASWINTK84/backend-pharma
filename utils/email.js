import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendVerificationEmail(to, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify/${token}`;
  const html = `
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
    <p>If you didn't sign up, ignore this message.</p>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Verify your SOCRP account',
    html
  });
}
