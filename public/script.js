const ws = new WebSocket('wss://chai-counter.onrender.com');

let userVote = null;

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.teaCount !== undefined && data.coffeeCount !== undefined) {
        document.getElementById('tea-count').innerText = data.teaCount;
        document.getElementById('coffee-count').innerText = data.coffeeCount;
    }
    if (data.userVote !== undefined) {
        userVote = data.userVote;
        updateButtons();
    }
};

function increment(item) {
    if (userVote !== item) {
        ws.send(JSON.stringify({ type: 'increment', item }));
    }
}

function resetCounts() {
    ws.send(JSON.stringify({ type: 'reset' }));
}

function updateButtons() {
    document.getElementById('tea-button').disabled = (userVote === 'tea');
    document.getElementById('coffee-button').disabled = (userVote === 'coffee');
    if (userVote === null) {
        document.getElementById('tea-button').disabled = false;
        document.getElementById('coffee-button').disabled = false;
    }
}
