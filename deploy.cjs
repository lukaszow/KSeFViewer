/**
 * Automated Deployment Script for czytajksef.pl
 * Flow: npm run build -> Connect SFTP -> Upload ./dist to HitMe
 */
const sftpClient = require('ssh2-sftp-client');
const path = require('path');
require('dotenv').config();
const { execSync } = require('child_process');

async function deploy() {
    const sftp = new sftpClient();

    const config = {
        host: process.env.DEPLOY_HOST,
        port: 2222, // Standard port for SFTP/SSH
        username: process.env.DEPLOY_USER,
        password: process.env.DEPLOY_PASS,
    };

    const localDir = path.join(__dirname, 'dist');
    const remoteDir = process.env.DEPLOY_REMOTE_PATH || '/public_html';

    try {
        console.log('🚀 Starting deployment process...');

        // Step 1: Build the project
        console.log('📦 Building the project...');
        execSync('npm run build', { stdio: 'inherit' });
        console.log('✅ Build completed.');

        // Step 2: Connect to server
        console.log(`🔗 Connecting to ${config.host}...`);
        await sftp.connect(config);
        console.log('✅ Connected to SFTP.');

        // Step 3: Upload files
        // uploadDir handles recursive upload and creates directories if needed
        console.log(`📤 Uploading files from ${localDir} to ${remoteDir}...`);
        await sftp.uploadDir(localDir, remoteDir);

        console.log('🎉 Deployment successful! Your app is live.');
    } catch (err) {
        console.error('❌ Deployment failed:', err.message);
        process.exit(1);
    } finally {
        await sftp.end();
    }
}

deploy();