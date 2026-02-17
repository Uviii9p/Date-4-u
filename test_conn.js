const axios = require('axios');

async function testConnection() {
    try {
        const res = await axios.get('http://127.0.0.1:5000/api/health');
        console.log('Backend Health:', res.data);

        // Test auth
        try {
            const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', {
                email: 'james@example.com',
                password: 'password123'
            });
            console.log('Login Success! Token received.');

            const token = loginRes.data.token;
            const discoveryRes = await axios.get('http://127.0.0.1:5000/api/users/discovery', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Discovery returned:', discoveryRes.data.length, 'profiles');
        } catch (e) {
            console.error('Login/Discovery failed:', e.response?.data || e.message);
        }
    } catch (e) {
        console.error('Could not reach backend:', e.message);
    }
}

testConnection();
