require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { v4: uuidv4 } = require('uuid');
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let teaCount = 0;
let coffeeCount = 0;
const userVotes = {};  // Stores user votes

const mongoUrl = process.env.MONGO_URL;
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex');  // Use generated secret if not set

const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(session({
    genid: () => uuidv4(),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ client })
}));

app.use(express.static('public'));

wss.on('connection', (ws, req) => {
    const userId = req.headers['sec-websocket-key'];
    
    if (!userVotes[userId]) {
        userVotes[userId] = null;  // No vote initially
    }

    // Send the current counts and user vote to the new client
    ws.send(JSON.stringify({ teaCount, coffeeCount, userVote: userVotes[userId] }));

    ws.on('message', message => {
        const data = JSON.parse(message);
        if (data.type === 'increment') {
            if (userVotes[userId]) {
                // Decrement the previous vote
                if (userVotes[userId] === 'tea') {
                    teaCount--;
                } else if (userVotes[userId] === 'coffee') {
                    coffeeCount--;
                }
            }
            // Increment the new vote
            if (data.item === 'tea') {
                teaCount++;
            } else if (data.item === 'coffee') {
                coffeeCount++;
            }
            userVotes[userId] = data.item;

            // Broadcast the updated counts and user votes to all clients
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ teaCount, coffeeCount, userVotes }));
                }
            });
        } else if (data.type === 'reset') {
            teaCount = 0;
            coffeeCount = 0;
            Object.keys(userVotes).forEach(user => {
                userVotes[user] = null;
            });
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ teaCount, coffeeCount, userVotes }));
                }
            });
        }
    });
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
