const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

const repairs = [
    {
        service: 'auth-service',
        // Based on grep result: postgres:task%40manage@db...
        content: 'DATABASE_URL="postgresql://postgres:task%40manage@db.qcthwvhphefynmtfefch.supabase.co:5432/postgres?connection_limit=10"'
    },
    {
        service: 'task-service',
        // Based on grep: ...schema=tasks...
        // FIXING THE PASSWORD ENCODING HERE: task@manage -> task%40manage
        content: 'DATABASE_URL="postgresql://postgres:task%40manage@db.qcthwvhphefynmtfefch.supabase.co:5432/postgres?sslmode=require&schema=tasks&connection_limit=10"'
    }
];

function repairService({ service, content }) {
    const envPath = path.join(rootDir, service, '.env');
    console.log(`Repairing ${service}...`);

    // Read existing to keep other keys if any (though usually just DB_URL)
    let existing = '';
    if (fs.existsSync(envPath)) {
        existing = fs.readFileSync(envPath, 'utf8');
    }

    // Remove valid/invalid DATABASE_URL lines
    const lines = existing.split('\n').filter(l => !l.startsWith('DATABASE_URL='));

    // Add new line
    lines.push(content);

    const newContent = lines.join('\n');
    fs.writeFileSync(envPath, newContent, 'utf8');
    console.log(`[${service}] .env fixed.`);
}

console.log('--- REPAIRING ENV FILES ---');
repairs.forEach(repairService);
console.log('--- DONE ---');
