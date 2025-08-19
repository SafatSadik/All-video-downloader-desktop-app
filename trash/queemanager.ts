// queueManager.js
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const queueFile = path.resolve('../quee.json');
let queue: any[] = [];
let isWriting = false;

// Load queue into memory at startup
async function loadQueue() {
    try {
        const data = await readFile(queueFile, 'utf8');
        queue = JSON.parse(data);
    } catch (err) {
        queue = [];
    }
}

async function saveQueue() {
    if (isWriting) return; // prevent overlapping writes
    isWriting = true;

    await writeFile(queueFile, JSON.stringify(queue, null, 4));
    isWriting = false;
}

// Update a specific queue item

function updateItem(id: any, updates: any) {
    const index = queue.findIndex(item => item.id === id);
    if (index !== -1) {
        queue[index] = { ...queue[index], ...updates };
    } else {
        queue.push({ id, ...updates });
    }
    saveQueue();
}

function getQueue() {
    return queue;
}

// Initialize
loadQueue();

export default { updateItem, getQueue };
