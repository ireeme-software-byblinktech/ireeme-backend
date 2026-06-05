// Quick test script to verify authentication and data
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api/v1';

async function test() {
    console.log('🧪 Testing Authentication and Data...\n');

    // 1. Login
    console.log('1️⃣ Logging in as admin@gmail.com...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@gmail.com',
            password: 'admin@123',
        }),
    });

    if (!loginResponse.ok) {
        console.error('❌ Login failed:', await loginResponse.text());
        return;
    }

    const { accessToken } = await loginResponse.json();
    console.log('✅ Login successful!');
    console.log('Token:', accessToken.substring(0, 50) + '...\n');

    // 2. Get current user info
    console.log('2️⃣ Getting current user info...');
    const meResponse = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!meResponse.ok) {
        console.error('❌ /auth/me failed:', await meResponse.text());
        return;
    }

    const user = await meResponse.json();
    console.log('✅ User info:', JSON.stringify(user, null, 2));
    console.log('');

    // 3. Get teachers
    console.log('3️⃣ Getting teachers...');
    const teachersResponse = await fetch(`${API_URL}/teachers?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!teachersResponse.ok) {
        console.error('❌ /teachers failed:', await teachersResponse.text());
        return;
    }

    const teachers = await teachersResponse.json();
    console.log('✅ Teachers response:', JSON.stringify(teachers, null, 2));
    console.log('');

    // 4. Get students
    console.log('4️⃣ Getting students...');
    const studentsResponse = await fetch(`${API_URL}/students?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!studentsResponse.ok) {
        console.error('❌ /students failed:', await studentsResponse.text());
        return;
    }

    const students = await studentsResponse.json();
    console.log('✅ Students response:', JSON.stringify(students, null, 2));
}

test().catch(console.error);
