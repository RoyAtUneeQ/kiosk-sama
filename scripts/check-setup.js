#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 Checking Generic Kiosk Frontend Setup...\n');

let errors = 0;
let warnings = 0;

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

if (majorVersion < 18) {
  console.log(`❌ Node.js ${nodeVersion} - Requires v20.0.0+`);
  errors++;
} else if (majorVersion < 20) {
  console.log(`⚠️  Node.js ${nodeVersion} - Works but v20+ recommended`);
  warnings++;
} else {
  console.log(`✅ Node.js ${nodeVersion}`);
}

// Check config.yaml
const configPath = path.join(__dirname, '..', 'src', 'assets', 'config.yaml');
if (fs.existsSync(configPath)) {
  console.log('✅ config.yaml exists');
} else {
  console.log('❌ config.yaml missing - Run: npm run setup');
  errors++;
}

// Check node_modules
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ Dependencies installed');
} else {
  console.log('❌ Dependencies not installed - Run: npm install');
  errors++;
}

// Check backend connectivity
console.log('\n🔌 Checking Backend Services...\n');

function checkService(url, name) {
  return new Promise((resolve) => {
    const request = http.get(url, { timeout: 2000 }, (res) => {
      if (res.statusCode && res.statusCode < 500) {
        console.log(`✅ ${name} reachable at ${url}`);
        resolve(true);
      } else {
        console.log(`⚠️  ${name} returned status ${res.statusCode}`);
        warnings++;
        resolve(false);
      }
    });

    request.on('error', () => {
      console.log(`❌ ${name} not reachable at ${url}`);
      console.log(`   Start the backend service first`);
      errors++;
      resolve(false);
    });

    request.on('timeout', () => {
      request.destroy();
      console.log(`❌ ${name} timeout at ${url}`);
      errors++;
      resolve(false);
    });
  });
}

async function checkBackend() {
  await checkService('http://localhost:3000/health', 'Backend API');

  // Check WebSocket (basic HTTP check since we can't easily test WS from here)
  await checkService('http://localhost:3001/', 'WebSocket Server');
}

await checkBackend();

// Check if frontend dev server is running
await checkService('http://localhost:5173/', 'Frontend Dev Server');

// Summary
console.log('\n═══════════════════════════════════════════════');
console.log('📊 Setup Check Summary');
console.log('═══════════════════════════════════════════════\n');

if (errors === 0 && warnings === 0) {
  console.log('✅ Everything looks good! Your setup is complete.\n');
  process.exit(0);
} else {
  if (errors > 0) {
    console.log(`❌ Found ${errors} error(s) that need to be fixed.`);
  }
  if (warnings > 0) {
    console.log(`⚠️  Found ${warnings} warning(s) to consider.`);
  }
  console.log('\nPlease address the issues above and run this check again.\n');
  process.exit(errors > 0 ? 1 : 0);
}
