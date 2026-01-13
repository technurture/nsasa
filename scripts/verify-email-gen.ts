
import {
    generatePasswordResetEmail,
    generateApprovalEmail,
    generateRegistrationPendingEmail,
    generateRoleChangeEmail,
    generateAccountNotFoundEmail
} from '../server/emailService';

console.log('--- Email Generation Verification ---');

// Test 1: Password Reset with Default Expiry
console.log('\n1. Password Reset (Default Expiry)');
const reset1 = generatePasswordResetEmail('http://localhost:5000/reset', 'John');
if (reset1.includes('1 hour') && reset1.includes('http://localhost:5000/reset')) {
    console.log('✅ Success: default expiry present and URL matches');
} else {
    console.error('❌ Failed: Content mismatch');
}

// Test 2: Password Reset with Custom Expiry
console.log('\n2. Password Reset (24 hours Expiry)');
const reset2 = generatePasswordResetEmail('http://localhost:5000/reset', 'John', '24 hours');
if (reset2.includes('24 hours')) {
    console.log('✅ Success: custom expiry present');
} else {
    console.error('❌ Failed: Content mismatch');
}

// Test 3: Approval Email with Custom Base URL (Production)
console.log('\n3. Approval Email (Production URL)');
const prodBase = 'https://nsasa.com';
const approval = generateApprovalEmail('Jane', 'Doe', true, prodBase);
if (approval.includes(`${prodBase}/login`)) {
    console.log('✅ Success: Production base URL used');
} else {
    console.error(`❌ Failed: Expected ${prodBase}/login`);
}

// Test 4: Registration Pending with Local Base URL
console.log('\n4. Registration Pending (Local URL)');
const localBase = 'http://localhost:3000';
const pending = generateRegistrationPendingEmail('Jane', localBase);
if (pending.includes(`${localBase}/login`)) {
    console.log('✅ Success: Local base URL used');
} else {
    console.error(`❌ Failed: Expected ${localBase}/login`);
}

// Test 5: Role Change with Custom Base URL
console.log('\n5. Role Change (Custom URL)');
const role = generateRoleChangeEmail('Admin', 'super_admin', 'http://localhost:3000');
if (role.includes('http://localhost:3000/login')) {
    console.log('✅ Success: Custom base URL used in Role Change');
} else {
    console.error('❌ Failed: URL generation error');
}
