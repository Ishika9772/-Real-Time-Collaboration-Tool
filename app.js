const editor = document.getElementById('editor');
const usersList = document.getElementById('users');
const socket = new WebSocket('ws://localhost:3000');

socket.onopen = () => {
    console.log('Connected to the WebSocket server');
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'init') {
        // Set initial content and active users
        editor.value = data.content;
        updateUsers(data.users);
    } else if (data.type === 'update') {
        // Update document with changes from other users
        editor.value = data.content;
    } else if (data.type === 'user_connected' || data.type === 'user_disconnected') {
        updateUsers(data.users);
    }
};

editor.addEventListener('input', () => {
    const content = editor.value;
    socket.send(JSON.stringify({ type: 'update', content }));
});

function updateUsers(users) {
    usersList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        usersList.appendChild(li);
    });
}
