const { prisma } = require('./config/prismaClient');

async function main() {
    try {
        console.log("--- DEBUGGING TASKS ---");
        const tasks = await prisma.task.findMany({
            include: {
                project: { select: { name: true } }
            }
        });

        if (tasks.length === 0) {
            console.log("No tasks found in the database.");
        } else {
            console.log(`Found ${tasks.length} tasks:`);
            tasks.forEach(task => {
                console.log(`\nTask: ${task.title} (ID: ${task.id})`);
                console.log(`Project: ${task.project?.name} (ID: ${task.projectId})`);
                console.log(`Creator ID: ${task.creatorId}`);
                console.log(`Assignee IDs: ${JSON.stringify(task.assigneeIds)}`);
                console.log(`Status: ${task.status}`);
            });
        }
    } catch (error) {
        console.error("Error inspecting DB:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
