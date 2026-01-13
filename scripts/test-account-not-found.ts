
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { generateAccountNotFoundEmail } from '../server/emailService';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function testAccountNotFoundEmail() {
    console.log('--- Account Not Found Email Debug Script ---');

    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
        console.error('ERROR: Missing SMTP_USER or SMTP_PASS environment variables.');
        return;
    }

    console.log('Attempting to create transporter...');

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
        console.log('Verifying connection settings...');
        await transporter.verify();

        console.log('Attempting to send Account Not Found email...');
        const info = await transporter.sendMail({
            from: `"Nsasa Debug" <${user}>`,
            to: user, // Send to self
            subject: 'Test: Account Not Found - Nsasa',
            html: generateAccountNotFoundEmail()
        });

        console.log('Account Not Found email sent successfully!');
        console.log('Message ID:', info.messageId);

    } catch (error: any) {
        console.error('FAILED to send email.');
        console.error(error);
    }
}

testAccountNotFoundEmail().catch(console.error);
