#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🚀 Setting up Generic Kiosk Frontend...\n');

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

if (majorVersion < 18) {
  console.error(`❌ Node.js version ${nodeVersion} is not supported.`);
  console.error('   Please upgrade to Node.js v18.0.0 or higher.');
  console.error('   Recommended: Node.js v20 LTS\n');
  process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if config.yaml exists
const configPath = path.join(__dirname, '..', 'src', 'assets', 'config.yaml');
const sampleConfigPath = path.join(__dirname, '..', 'src', 'assets', 'config.sample.yaml');

if (!fs.existsSync(configPath)) {
  console.log('\n📋 Configuration file not found. Creating from sample...');
  
  if (fs.existsSync(sampleConfigPath)) {
    try {
      fs.copyFileSync(sampleConfigPath, configPath);
      console.log('✅ Created config.yaml from config.sample.yaml');
      console.log('   Please edit src/assets/config.yaml to configure your environment.\n');
    } catch (error) {
      console.error('❌ Failed to create config.yaml:', error.message);
      process.exit(1);
    }
  } else {
    console.error('❌ config.sample.yaml not found!');
    console.error('   Cannot create configuration file.');
    process.exit(1);
  }
} else {
  console.log('✅ Configuration file exists: src/assets/config.yaml');
}

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('\n🔧 Optional: .env.local not found.');
  console.log('   You can create it from .env.example for environment overrides.');
  console.log('   Run: cp .env.example .env.local\n');
}

// Check dependencies
console.log('📦 Checking dependencies...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
  console.log('   Dependencies not installed. Please run: npm install\n');
} else {
  console.log('✅ Dependencies are installed\n');
}

// Provide next steps
console.log('═══════════════════════════════════════════════');
console.log('📋 Next Steps:');
console.log('═══════════════════════════════════════════════\n');
console.log('1. Edit configuration (if needed):');
console.log('   src/assets/config.yaml\n');
console.log('2. Start the backend service:');
console.log('   cd ../backend && npm run dev\n');
console.log('3. Start the frontend:');
console.log('   npm run dev\n');
console.log('4. Open browser:');
console.log('   http://localhost:5173\n');
console.log('═══════════════════════════════════════════════\n');
console.log('For more information, see SETUP.md or README.md\n');