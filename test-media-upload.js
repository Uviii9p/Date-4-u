// Test script to verify media upload system
// Run this in browser console when on a chat page

async function testMediaUploadSystem() {
    console.log('🧪 Testing Media Upload System...\n');

    // Test 1: Check if file inputs exist
    console.log('1️⃣ Checking file inputs...');
    const fileInput = document.querySelector('input[type="file"][accept*="image/jpeg"]');
    const videoInput = document.querySelector('input[type="file"][accept*="video"]');
    const cameraInput = document.querySelector('input[type="file"][capture]');

    console.log('   ✓ Photo input:', fileInput ? '✅ Found' : '❌ Missing');
    console.log('   ✓ Video input:', videoInput ? '✅ Found' : '❌ Missing');
    console.log('   ✓ Camera input:', cameraInput ? '✅ Found' : '❌ Missing');
    console.log('   ✓ Camera mode:', cameraInput?.getAttribute('capture') || 'N/A');

    // Test 2: Check API endpoint
    console.log('\n2️⃣ Checking API endpoint...');
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        console.log('   ✓ Server status:', data.status === 'UP' ? '✅ Online' : '❌ Offline');
        console.log('   ✓ Storage:', data.storage);
    } catch (error) {
        console.log('   ❌ Server unreachable:', error.message);
    }

    // Test 3: Check uploads directory accessibility
    console.log('\n3️⃣ Checking uploads directory...');
    try {
        const testUrl = '/uploads/chat/test.jpg';
        const response = await fetch(testUrl);
        console.log('   ✓ Uploads route:', response.status === 404 ? '✅ Configured (404 expected)' : `⚠️ Status: ${response.status}`);
    } catch (error) {
        console.log('   ❌ Uploads route error:', error.message);
    }

    // Test 4: Check localStorage for auth token
    console.log('\n4️⃣ Checking authentication...');
    const token = localStorage.getItem('token');
    console.log('   ✓ Auth token:', token ? '✅ Present' : '❌ Missing');

    // Test 5: Check socket connection
    console.log('\n5️⃣ Checking socket connection...');
    console.log('   ℹ️ Check network tab for socket.io connection');

    console.log('\n✅ Test complete! Check results above.');
    console.log('\n📝 To test actual upload:');
    console.log('   1. Click paperclip icon');
    console.log('   2. Select Photo/Video/Camera');
    console.log('   3. Choose a file');
    console.log('   4. Watch console for upload logs');
}

// Auto-run test
testMediaUploadSystem();
