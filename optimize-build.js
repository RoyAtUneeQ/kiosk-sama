#!/usr/bin/env node

/**
 * Build Optimization Script
 * 
 * Additional optimizations for the React build process:
 * - Bundle analysis
 * - Asset optimization
 * - Cache header suggestions
 * - Performance recommendations
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BUILD_DIR = 'dist';
const ANALYSIS_FILE = 'build-analysis.json';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Get file size in a human readable format
function getHumanSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Calculate file hash for integrity verification
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

// Analyze build directory
function analyzeBuild() {
  if (!fs.existsSync(BUILD_DIR)) {
    log('red', `❌ Build directory '${BUILD_DIR}' not found. Run 'npm run build' first.`);
    process.exit(1);
  }

  log('blue', '📊 Analyzing build directory...\n');

  const analysis = {
    timestamp: new Date().toISOString(),
    buildDir: BUILD_DIR,
    files: [],
    summary: {
      totalFiles: 0,
      totalSize: 0,
      jsFiles: [],
      cssFiles: [],
      assetFiles: [],
      htmlFiles: []
    }
  };

  // Recursively analyze files
  function analyzeDirectory(dir, relativePath = '') {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relPath = path.join(relativePath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        analyzeDirectory(fullPath, relPath);
      } else {
        const fileInfo = {
          name: item,
          path: relPath,
          size: stats.size,
          humanSize: getHumanSize(stats.size),
          hash: getFileHash(fullPath),
          ext: path.extname(item).toLowerCase(),
          isFingerprinted: /\.[a-f0-9]{8}\./i.test(item) // Check for Vite hash pattern
        };

        analysis.files.push(fileInfo);
        analysis.summary.totalFiles++;
        analysis.summary.totalSize += stats.size;

        // Categorize files
        if (fileInfo.ext === '.js') {
          analysis.summary.jsFiles.push(fileInfo);
        } else if (fileInfo.ext === '.css') {
          analysis.summary.cssFiles.push(fileInfo);
        } else if (fileInfo.ext === '.html') {
          analysis.summary.htmlFiles.push(fileInfo);
        } else {
          analysis.summary.assetFiles.push(fileInfo);
        }
      }
    }
  }

  analyzeDirectory(BUILD_DIR);

  // Sort files by size (largest first)
  analysis.files.sort((a, b) => b.size - a.size);
  analysis.summary.jsFiles.sort((a, b) => b.size - a.size);
  analysis.summary.cssFiles.sort((a, b) => b.size - a.size);

  return analysis;
}

// Generate performance recommendations
function generateRecommendations(analysis) {
  const recommendations = [];

  // Large JavaScript files
  const largeJSFiles = analysis.summary.jsFiles.filter(f => f.size > 500 * 1024); // > 500KB
  if (largeJSFiles.length > 0) {
    recommendations.push({
      type: 'warning',
      category: 'Bundle Size',
      message: `Found ${largeJSFiles.length} large JavaScript files`,
      details: largeJSFiles.map(f => `${f.name}: ${f.humanSize}`),
      suggestion: 'Consider code splitting, lazy loading, or tree shaking to reduce bundle size'
    });
  }

  // Check for fingerprinting
  const unFingerprintedAssets = analysis.files.filter(f => 
    !f.isFingerprinted && 
    f.ext !== '.html' && 
    f.ext !== '.json' &&
    !f.name.startsWith('.')
  );

  if (unFingerprintedAssets.length > 0) {
    recommendations.push({
      type: 'info',
      category: 'Caching',
      message: `Found ${unFingerprintedAssets.length} non-fingerprinted files`,
      details: unFingerprintedAssets.map(f => f.name),
      suggestion: 'These files should have shorter cache TTLs in your CDN configuration'
    });
  }

  // Asset optimization opportunities
  const imageFiles = analysis.summary.assetFiles.filter(f => 
    ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(f.ext)
  );

  if (imageFiles.some(f => f.size > 1024 * 1024)) { // > 1MB
    recommendations.push({
      type: 'suggestion',
      category: 'Asset Optimization',
      message: 'Found large image files',
      details: imageFiles.filter(f => f.size > 1024 * 1024).map(f => `${f.name}: ${f.humanSize}`),
      suggestion: 'Consider using WebP format, image compression, or responsive images'
    });
  }

  return recommendations;
}

// Generate cache configuration suggestions
function generateCacheConfig(analysis) {
  return {
    longTermCache: {
      description: 'Files with content hashes - cache for 1 year',
      pattern: '*.js, *.css, /assets/*',
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      },
      files: analysis.files.filter(f => f.isFingerprinted).length
    },
    shortTermCache: {
      description: 'HTML and config files - no cache or short cache',
      pattern: '*.html, *.json, config.yaml',
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate'
      },
      files: analysis.summary.htmlFiles.length + 
             analysis.files.filter(f => f.ext === '.json' || f.name.includes('config')).length
    },
    mediumTermCache: {
      description: 'Other assets without hashes - 1 hour cache',
      pattern: 'Other static assets',
      headers: {
        'Cache-Control': 'public, max-age=3600'
      },
      files: analysis.files.filter(f => 
        !f.isFingerprinted && 
        f.ext !== '.html' && 
        f.ext !== '.json' &&
        !f.name.includes('config')
      ).length
    }
  };
}

// Print analysis report
function printReport(analysis, recommendations, cacheConfig) {
  console.log('\n' + '='.repeat(60));
  log('cyan', '📦 BUILD ANALYSIS REPORT');
  console.log('='.repeat(60));

  // Summary
  log('blue', '\n📊 Build Summary:');
  console.log(`   Total Files: ${analysis.summary.totalFiles}`);
  console.log(`   Total Size: ${getHumanSize(analysis.summary.totalSize)}`);
  console.log(`   JavaScript Files: ${analysis.summary.jsFiles.length}`);
  console.log(`   CSS Files: ${analysis.summary.cssFiles.length}`);
  console.log(`   Asset Files: ${analysis.summary.assetFiles.length}`);
  console.log(`   HTML Files: ${analysis.summary.htmlFiles.length}`);

  // Largest files
  log('blue', '\n📋 Largest Files:');
  const topFiles = analysis.files.slice(0, 10);
  topFiles.forEach((file, index) => {
    const icon = file.isFingerprinted ? '🔒' : '📄';
    console.log(`   ${index + 1}. ${icon} ${file.name} (${file.humanSize})`);
  });

  // JavaScript analysis
  if (analysis.summary.jsFiles.length > 0) {
    log('blue', '\n🚀 JavaScript Bundles:');
    analysis.summary.jsFiles.forEach(file => {
      const status = file.size > 500 * 1024 ? '⚠️' : '✅';
      console.log(`   ${status} ${file.name} - ${file.humanSize}`);
    });
  }

  // Cache configuration
  log('blue', '\n💾 Recommended Cache Configuration:');
  Object.entries(cacheConfig).forEach(([key, config]) => {
    console.log(`\n   ${key.toUpperCase()}:`);
    console.log(`   Description: ${config.description}`);
    console.log(`   Pattern: ${config.pattern}`);
    console.log(`   Files: ${config.files}`);
    console.log(`   Headers: ${JSON.stringify(config.headers, null, 2).replace(/\n/g, '\n   ')}`);
  });

  // Recommendations
  if (recommendations.length > 0) {
    log('yellow', '\n💡 Recommendations:');
    recommendations.forEach((rec, index) => {
      const icon = rec.type === 'warning' ? '⚠️' : rec.type === 'suggestion' ? '💡' : 'ℹ️';
      console.log(`\n   ${index + 1}. ${icon} ${rec.category}: ${rec.message}`);
      
      if (rec.details && rec.details.length > 0) {
        rec.details.forEach(detail => {
          console.log(`      - ${detail}`);
        });
      }
      
      if (rec.suggestion) {
        log('cyan', `      💭 ${rec.suggestion}`);
      }
    });
  } else {
    log('green', '\n✅ No optimization recommendations - build looks good!');
  }

  console.log('\n' + '='.repeat(60));
  log('green', '✅ Analysis complete!');
  console.log('='.repeat(60) + '\n');
}

// Save analysis to file
function saveAnalysis(analysis, recommendations, cacheConfig) {
  const reportData = {
    analysis,
    recommendations,
    cacheConfig,
    generatedAt: new Date().toISOString()
  };

  fs.writeFileSync(ANALYSIS_FILE, JSON.stringify(reportData, null, 2));
  log('blue', `💾 Analysis saved to ${ANALYSIS_FILE}`);
}

// Main execution
function main() {
  try {
    log('blue', '🔍 Starting build analysis...\n');

    const analysis = analyzeBuild();
    const recommendations = generateRecommendations(analysis);
    const cacheConfig = generateCacheConfig(analysis);

    printReport(analysis, recommendations, cacheConfig);
    saveAnalysis(analysis, recommendations, cacheConfig);

    // Exit with appropriate code
    const hasWarnings = recommendations.some(r => r.type === 'warning');
    process.exit(hasWarnings ? 1 : 0);

  } catch (error) {
    log('red', `❌ Error during analysis: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  analyzeBuild,
  generateRecommendations,
  generateCacheConfig
};