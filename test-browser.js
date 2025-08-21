
import http from 'http';

// Create a simple test to fetch the main page and check for common issues
async function testSite() {
  return new Promise((resolve) => {
    http.get('http://localhost:5173/', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Page loaded successfully');
        console.log('HTML length:', data.length);
        
        // Check for common issues
        if (data.includes('Error')) {
          console.log('Found "Error" in page content');
        }
        if (data.includes('<!doctype html>')) {
          console.log('✓ Valid HTML document');
        }
        if (data.includes('src="/src/main.tsx"')) {
          console.log('✓ Main entry point found');
        }
        
        resolve();
      });
    }).on('error', (err) => {
      console.error('Error connecting:', err.message);
      resolve();
    });
  });
}

testSite().then(() => process.exit(0));