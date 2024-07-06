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
    const teaButton = document.getElementById('tea-button');
    const coffeeButton = document.getElementById('coffee-button');

    teaButton.disabled = (userVote === 'tea');
    coffeeButton.disabled = (userVote === 'coffee');

    teaButton.classList.remove('selected');
    coffeeButton.classList.remove('selected');

    if (userVote === 'tea') {
        teaButton.classList.add('selected');
    } else if (userVote === 'coffee') {
        coffeeButton.classList.add('selected');
    } else {
        teaButton.disabled = false;
        coffeeButton.disabled = false;
    }
}
