import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail || 'onboarding@resend.dev'
  };
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    
    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Resend email error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', data);
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
          <div class="logo">Nsasa</div>
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
  const loginUrl = process.env.REPLIT_DOMAINS 
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/login`
    : 'https://your-app-url.com/login';

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
          <div class="logo">Nsasa</div>
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
