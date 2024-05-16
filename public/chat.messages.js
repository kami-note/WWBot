const fs = require('fs');

const jsonString = fs.readFileSync('public/messages.json', 'utf-8');
const jsonMessages = JSON.parse(jsonString);

function formatMessage(message) {
    return message.replace(/[^\w]/gi, '').trim().toLowerCase();
}

function initMessages(client) {
    client.on('message_create', receivedMessage => {
        if (receivedMessage != null) {
            const receivedBody = formatMessage(receivedMessage.body);
            console.log('Received message:', receivedBody);
            const response = jsonMessages[receivedBody];
            if (response) {
                console.log('Sending response:', response);
                client.sendMessage(receivedMessage.from, response);
            } else if (response === null){
                console.log('No response found for:', receivedBody);
                client.sendMessage(receivedMessage.from, "Desculpe, não entendi a sua pergunta.");
            }
        }
    });
}

module.exports = { initMessages };
