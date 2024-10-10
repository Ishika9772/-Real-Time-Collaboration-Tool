const express = require('express');
const WebSocket = require('ws');
const app = express();

const port = 3000;

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const wss = new WebSocket.Server({ server });

// Store active users and document content
let users = [];
let documentContent = '';

wss.on('connection', (ws) => {
    console.log('New client connected');

    // Add new user to the users list
    const userId = `User_${Math.floor(Math.random() * 1000)}`;
    users.push(userId);
    
    // Send initial document content and user list to the new user
    ws.send(JSON.stringify({
        type: 'init',
        content: documentContent,
        users
    }));

    // Broadcast the presence of a new user
    wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'user_connected', userId }));
        }
    });

    // Handle incoming messages (document changes)
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        if (data.type === 'update') {
            documentContent = data.content;
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'update', content: documentContent }));
                }
            });
        }
    });

    // When a user disconnects
    ws.on('close', () => {
        console.log('Client disconnected');
        users = users.filter(user => user !== userId);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'user_disconnected', userId }));
            }
        });
    });
});
