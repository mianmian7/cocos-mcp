/**
 * Package script for creating distribution zip
 * Usage: node scripts/package.mjs
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Read package.json for version info
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const version = pkg.version;
const name = pkg.name;

// Output zip filename
const zipName = `${name}-v${version}.zip`;
const outputDir = 'release';

// Files/directories to include in the distribution
const includeFiles = [
    'dist',           // Compiled code with bundled dependencies
    'i18n',           // Internationalization files
    'static',         // Static assets (templates, styles)
    '@types',         // Type definitions for Cocos
    'package.json',   // Extension manifest
    'README.md',      // Documentation
];

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Check if all required files exist
console.log('📋 Checking required files...');
for (const file of includeFiles) {
    if (!fs.existsSync(file)) {
        console.error(`❌ Missing required file: ${file}`);
        console.log('   Run "npm run build" first!');
        process.exit(1);
    }
    console.log(`   ✓ ${file}`);
}

// Create zip using PowerShell (Windows) or zip command (Unix)
console.log(`\n📦 Creating ${zipName}...`);

const zipPath = path.join(outputDir, zipName);

// Remove old zip if exists
if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
}

// Use PowerShell Compress-Archive on Windows
const isWindows = process.platform === 'win32';

if (isWindows) {
    // PowerShell command to create zip - need to quote paths with special characters
    const quotedFiles = includeFiles.map(f => `'${f}'`).join(',');
    const psCommand = `Compress-Archive -Path ${quotedFiles} -DestinationPath '${zipPath}' -Force`;

    try {
        execSync(`powershell -Command "${psCommand}"`, { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Failed to create zip:', error.message);
        process.exit(1);
    }
} else {
    // Unix zip command
    const filesToZip = includeFiles.join(' ');
    try {
        execSync(`zip -r "${zipPath}" ${filesToZip}`, { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Failed to create zip:', error.message);
        console.log('   Make sure "zip" is installed');
        process.exit(1);
    }
}

// Get zip file size
const stats = fs.statSync(zipPath);
const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

console.log(`\n🎉 Package created successfully!`);
console.log(`   📁 ${zipPath}`);
console.log(`   📏 Size: ${sizeMB} MB`);
console.log(`\n📝 Installation instructions:`);
console.log(`   1. Open Cocos Creator`);
console.log(`   2. Go to Extension Manager`);
console.log(`   3. Click "Import Extension" and select the zip file`);
console.log(`   Or extract to: [Cocos Creator]/extensions/${name}/`);
