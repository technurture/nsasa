import nodemailer from 'nodemailer';
import path from 'path';
import { config } from './config';

interface EmailCredentials {
  user: string;
  pass: string;
}

// Replit-specific credential retrieval (legacy/unused for Zoho but kept for structure compatibility if needed, though we will simplify to Env vars for now as requested)
// We will focus on ZOHO_EMAIL and ZOHO_PASSWORD from process.env

function getCredentials(): EmailCredentials | null {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('No SMTP email credentials found (SMTP_USER, SMTP_PASS). Email service will be mocked.');
    return null;
  }

  return { user, pass };
}

async function getTransporter() {
  const creds = getCredentials();
  if (!creds) return null;

  return nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: creds.user,
      pass: creds.pass
    }
  });
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const transporter = await getTransporter();

    if (!transporter) {
      console.log('----------------------------------------------------');
      console.log(`[MOCK EMAIL SERVICE] To: ${options.to}`);
      console.log(`[MOCK EMAIL SERVICE] Subject: ${options.subject}`);

      // Extract link for easy testing
      const linkMatch = options.html.match(/href="([^"]+)"/);
      if (linkMatch) {
        console.log(`[MOCK EMAIL SERVICE] Link: ${linkMatch[1]}`);
      }

      console.log('----------------------------------------------------');
      return;
    }

    const creds = getCredentials();
    const fromEmail = creds?.user || 'noreply@nsasa.com'; // Fallback that shouldn't be hit if transporter exists

    const info = await transporter.sendMail({
      from: `"Nsasa Portal" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: [{
        filename: 'logo.jpeg',
        path: path.join(process.cwd(), 'client', 'public', 'logo.jpeg'),
        cid: 'logo'
      }]
    });

    console.log('Email sent successfully:', info.messageId);
  } catch (error: any) {
    console.error('Email service error:', error);
    throw error;
  }
}

export function generatePasswordResetEmail(resetUrl: string, firstName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        h1 {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
        }
        p {
          color: #4b5563;
          margin-bottom: 15px;
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: #ffffff;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 600;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .link {
          color: #2563eb;
          word-break: break-all;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <img src="cid:logo" alt="Nsasa UniAbuja" style="height: 80px; width: auto; margin-bottom: 10px; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: #2563eb;">Nsasa UniAbuja</div>
          </div>
          <p style="color: #6b7280; margin: 0;">Department of Sociology Portal</p>
        </div>
        
        <h1>Reset Your Password</h1>
        
        <p>Hi ${firstName},</p>
        
        <p>We received a request to reset your password for your Nsasa account. Click the button below to create a new password:</p>
        
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p class="link">${resetUrl}</p>
        
        <div class="warning">
          <strong>⚠️ Important:</strong> This password reset link will expire in 1 hour for security reasons.
        </div>
        
        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        
        <div class="footer">
          <p>This is an automated email from Nsasa - Department of Sociology Portal.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateApprovalEmail(firstName: string, lastName: string, approved: boolean): string {
  const status = approved ? 'Approved' : 'Rejected';
  const statusColor = approved ? '#10b981' : '#ef4444';
  const loginUrl = `${config.frontendUrl}/login`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account ${status}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .status-badge {
          display: inline-block;
          background-color: ${statusColor};
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          margin: 20px 0;
        }
        h1 {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
        }
        p {
          color: #4b5563;
          margin-bottom: 15px;
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: #ffffff;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 600;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .info-box {
          background-color: #f3f4f6;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <img src="cid:logo" alt="Nsasa UniAbuja" style="height: 80px; width: auto; margin-bottom: 10px; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: #2563eb;">Nsasa UniAbuja</div>
          </div>
          <p style="color: #6b7280; margin: 0;">Department of Sociology Portal</p>
          <div class="status-badge">${status}</div>
        </div>
        
        <h1>Account ${status}</h1>
        
        <p>Hi ${firstName} ${lastName},</p>
        
        ${approved ? `
          <p>Great news! Your Nsasa account has been approved by our administrators. You now have full access to the Department of Sociology Portal.</p>
          
          <div class="info-box">
            <strong>What you can do now:</strong>
            <ul style="margin: 10px 0;">
              <li>Access all blog posts and resources</li>
              <li>Participate in department events</li>
              <li>Connect with fellow students</li>
              <li>Update your profile and preferences</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Login to Your Account</a>
          </div>
          
          <p>We're excited to have you as part of the Nsasa community!</p>
        ` : `
          <p>Thank you for your interest in joining the Nsasa platform. After careful review, we regret to inform you that your account registration has not been approved at this time.</p>
          
          <div class="info-box">
            <strong>Common reasons for rejection:</strong>
            <ul style="margin: 10px 0;">
              <li>Invalid or incomplete information</li>
              <li>Matric number not found in our records</li>
              <li>Not a Department of Sociology student</li>
            </ul>
          </div>
          
          <p>If you believe this was a mistake or would like to discuss your application, please contact our support team.</p>
        `}
        
        <div class="footer">
          <p>This is an automated email from Nsasa - Department of Sociology Portal.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  firstName: string
): Promise<void> {
  await sendEmail({
    to,
    subject: 'Reset Your Password - Nsasa',
    html: generatePasswordResetEmail(resetUrl, firstName)
  });
}

export async function sendApprovalEmail(
  to: string,
  firstName: string,
  lastName: string,
  approved: boolean
): Promise<void> {
  const subject = approved
    ? 'Your Account Has Been Approved - Nsasa'
    : 'Account Registration Update - Nsasa';

  await sendEmail({
    to,
    subject,
    html: generateApprovalEmail(firstName, lastName, approved)
  });
}

export function generateRegistrationPendingEmail(firstName: string): string {
  const loginUrl = `${config.frontendUrl}/login`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registration Received</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        h1 {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
        }
        p {
          color: #4b5563;
          margin-bottom: 15px;
        }
        .info-box {
          background-color: #f3f4f6;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <img src="cid:logo" alt="Nsasa UniAbuja" style="height: 80px; width: auto; margin-bottom: 10px; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: #2563eb;">Nsasa UniAbuja</div>
          </div>
          <p style="color: #6b7280; margin: 0;">Department of Sociology Portal</p>
        </div>
        
        <h1>Registration Pending Approval</h1>
        
        <p>Hi ${firstName},</p>
        
        <p>Thank you for registering on the Nsasa Portal! We have received your request.</p>
        
        <div class="info-box">
          <strong>What happens next?</strong>
          <p style="margin-top: 10px;">Your account is currently pending approval from our administrators. This process helps us ensure that only verified Department of Sociology students have access to the portal.</p>
          <p>You will receive another email once your account has been approved or if we need more information.</p>
        </div>
        
        <p>In the meantime, you can explore our public pages.</p>
        
        <div class="footer">
          <p>This is an automated email from Nsasa - Department of Sociology Portal.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateRoleChangeEmail(firstName: string, newRole: string): string {
  const loginUrl = `${config.frontendUrl}/login`;
  const roleDisplay = newRole === 'super_admin' ? 'Super Admin' : newRole.charAt(0).toUpperCase() + newRole.slice(1);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Role Updated</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        h1 {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
        }
        p {
          color: #4b5563;
          margin-bottom: 15px;
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: #ffffff;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 600;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <img src="cid:logo" alt="Nsasa UniAbuja" style="height: 80px; width: auto; margin-bottom: 10px; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: #2563eb;">Nsasa UniAbuja</div>
          </div>
          <p style="color: #6b7280; margin: 0;">Department of Sociology Portal</p>
        </div>
        
        <h1>Role Updated</h1>
        
        <p>Hi ${firstName},</p>
        
        <p>Your account role on the Nsasa Portal has been updated to: <strong>${roleDisplay}</strong>.</p>
        
        <p>This may give you access to new features and capabilities within the portal. Please log in to see the changes.</p>
        
        <div style="text-align: center;">
          <a href="${loginUrl}" class="button">Login to Portal</a>
        </div>
        
        <div class="footer">
          <p>This is an automated email from Nsasa - Department of Sociology Portal.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendRegistrationPendingEmail(
  to: string,
  firstName: string
): Promise<void> {
  await sendEmail({
    to,
    subject: 'Registration Pending Approval - Nsasa',
    html: generateRegistrationPendingEmail(firstName)
  });
}

export async function sendRoleChangeEmail(
  to: string,
  firstName: string,
  newRole: string
): Promise<void> {
  await sendEmail({
    to,
    subject: 'Account Role Updated - Nsasa',
    html: generateRoleChangeEmail(firstName, newRole)
  });
}

export function generateAccountNotFoundEmail(): string {
  const registerUrl = `${config.frontendUrl}/register`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Not Found</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        h1 {
          color: #1f2937;
          font-size: 24px;
          margin-bottom: 20px;
        }
        p {
          color: #4b5563;
          margin-bottom: 15px;
        }
        .button {
          display: inline-block;
          background-color: #2563eb;
          color: #ffffff;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 600;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <img src="cid:logo" alt="Nsasa UniAbuja" style="height: 80px; width: auto; margin-bottom: 10px; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: #2563eb;">Nsasa UniAbuja</div>
          </div>
          <p style="color: #6b7280; margin: 0;">Department of Sociology Portal</p>
        </div>
        
        <h1>Account Not Found</h1>
        
        <p>Hi there,</p>
        
        <p>We received a request to reset the password for this email address, but we couldn't find an account associated with it.</p>
        
        <p>If you haven't joined the Nsasa Portal yet, we'd love to have you! Click the button below to create your account:</p>
        
        <div style="text-align: center;">
          <a href="${registerUrl}" class="button">Create an Account</a>
        </div>
        
        <p>If you believe you already have an account, please check for typos in your email address or contact support.</p>
        
        <div class="footer">
          <p>This is an automated email from Nsasa - Department of Sociology Portal.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendAccountNotFoundEmail(to: string): Promise<void> {
  await sendEmail({
    to,
    subject: 'Account Not Found - Nsasa',
    html: generateAccountNotFoundEmail()
  });
}
