
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function testEmail() {
    console.log('--- Email Debug Script ---');

    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    console.log(`SMTP_USER present: ${!!user}`);
    console.log(`SMTP_PASS present: ${!!pass}`);

    if (!user || !pass) {
        console.error('ERROR: Missing SMTP_USER or SMTP_PASS environment variables.');
        return;
    }

    console.log('Attempting to create transporter...');

    // Configuration from emailService.ts
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
        console.log('Connection verified successfully!');

        console.log('Attempting to send test email...');
        const info = await transporter.sendMail({
            from: `"Nsasa Debug" <${user}>`,
            to: user, // Send to self
            subject: 'Nsasa Email Test',
            text: 'This is a test email from the Nsasa Portal debug script. If you received this, email sending is working.',
            html: '<h1>Email Test Successful</h1><p>This is a test email from the Nsasa Portal debug script. If you received this, email sending is working.</p>'
        });

        console.log('Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);

    } catch (error: any) {
        console.error('FAILED to send email.');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.code) console.error('Error code:', error.code);
        if (error.command) console.error('Command:', error.command);
        if (error.response) console.error('Response:', error.response);
    }
}

testEmail().catch(console.error);
