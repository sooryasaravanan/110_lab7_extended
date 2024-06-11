function showEditForm(roomName, messageId, messageBody) {
    const form = document.getElementById(`edit-form-${messageId}`);
    form.style.display = 'block';
    form.querySelector('input[name="newMessage"]').value = messageBody.replace(/'/g, '&#39;');
}

async function fetchMessages() {
    try {
        const response = await fetch(`/api/{{roomName}}/messages`);
        if (response.ok) {
            const messages = await response.json();
            updateMessageList(messages);
            console.log('Fetched');
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

// Dynamic Fetch
function updateMessageList(messages) {
    const messageList = document.getElementById('messages');
    messageList.innerHTML = '';

    messages.forEach(message => {
        const messageItem = document.createElement('li');
        messageItem.id = `message-${message._id}`;
        messageItem.innerHTML = `
            <strong>${message.nickname}</strong>
            <p>${escapeHtml(message.body)}</p>
            <button onclick="showEditForm('{{../roomName}}', '${message._id}', '${escapeHtml(message.body)}')">Edit</button>
            <form id="edit-form-${message._id}" action="/{{../roomName}}/messages/${message._id}/edit" method="post" style="display:none;">
                <input type="text" name="newMessage" value="${escapeHtml(message.body)}" required>
                <button type="submit">Update</button>
            </form>
        `;
        messageList.appendChild(messageItem);
    });
}

// Escape HTML function to prevent XSS
function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"']/g, function (m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[m];
    });
}

// Reload the page every 7 seconds
setInterval(() => {
    location.reload();
}, 7000);

fetchMessages();
