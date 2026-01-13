
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { generatePasswordResetEmail } from '../server/emailService';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function testLogoEmail() {
    console.log('--- Logo Email Debug Script ---');

    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
        console.error('ERROR: Missing SMTP_USER or SMTP_PASS environment variables.');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: user,
            pass: pass
        }
    });

    try {
        console.log('Attempting to send Logo Test email...');
        // Using the password reset template as a representative sample
        const htmlContent = generatePasswordResetEmail("http://test-link.com", "Test User");

        const info = await transporter.sendMail({
            from: `"Nsasa Debug" <${user}>`,
            to: user, // Send to self
            subject: 'Test: Email with Logo - Nsasa UniAbuja',
            html: htmlContent
        });

        console.log('Logo Test email sent successfully!');
        console.log('Message ID:', info.messageId);

    } catch (error: any) {
        console.error('FAILED to send email.');
        console.error(error);
    }
}

testLogoEmail().catch(console.error);
