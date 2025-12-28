const fs = require('fs');
const path = require('path');

const services = [
    'analytics-service',
    'auth-service',
    'file-service',
    'notification-service',
    'task-service'
];

const rootDir = __dirname;

function optimizeService(serviceName) {
    const envPath = path.join(rootDir, serviceName, '.env');

    if (!fs.existsSync(envPath)) {
        console.log(`[${serviceName}] No .env file found.`);
        return;
    }

    let envContent = fs.readFileSync(envPath, 'utf8');

    // Regex to find DATABASE_URL
    const dbUrlRegex = /(DATABASE_URL=["']?.*?["']?)/;
    const match = envContent.match(dbUrlRegex);

    if (!match) {
        console.log(`[${serviceName}] No DATABASE_URL found in .env.`);
        return;
    }

    let dbLine = match[0];

    // Clean up existing params
    // Logic: 
    // 1. Remove existing connection_limit param if any
    // 2. Append new connection_limit=10

    let newDbLine = dbLine;

    if (newDbLine.includes('connection_limit=')) {
        newDbLine = newDbLine.replace(/connection_limit=\d+/, 'connection_limit=10');
    } else {
        // Append it
        // handle quotes
        const hasQuote = newDbLine.trim().endsWith('"') || newDbLine.trim().endsWith("'");
        let urlPart = hasQuote ? newDbLine.slice(0, -1) : newDbLine;
        const quote = hasQuote ? newDbLine.slice(-1) : '';

        const separator = urlPart.includes('?') ? '&' : '?';
        newDbLine = urlPart + separator + 'connection_limit=10' + quote;
    }

    if (newDbLine !== dbLine) {
        const newContent = envContent.replace(dbLine, newDbLine);
        fs.writeFileSync(envPath, newContent, 'utf8');
        console.log(`[${serviceName}] Updated to connection_limit=10.`);
    } else {
        console.log(`[${serviceName}] Already set to 10.`);
    }
}

console.log('--- OPTIMIZING CONNECTIONS (FORCE 10) ---');
services.forEach(optimizeService);
console.log('--- DONE ---');
