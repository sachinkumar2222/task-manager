const { prisma } = require('./config/prismaClient');
const Task = require('./models/taskModel');

async function main() {
    const kumarId = '191476e5-cb2f-43f1-9637-a732f66a4d0d'; // Kumar's ID from debug_users.js

    console.log(`Testing findByCreator for ID: ${kumarId}`);

    try {
        const tasks = await Task.findByCreator(kumarId);
        console.log(`Found ${tasks.length} created tasks.`);
        console.log(JSON.stringify(tasks, null, 2));
    } catch (error) {
        console.error("Query Failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
