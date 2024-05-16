const fs = require('fs');

const jsonString = fs.readFileSync('public/messages.json', 'utf-8');
const jsonMessages = JSON.parse(jsonString);

function initMessages(client) {
    client.on('message_create', receivedMessage => {
        if (receivedMessage != null) {
            switch (receivedMessage.body) {
                case 'ping':
                    client.sendMessage(receivedMessage.from, 'pong');
                    break;
                case 'Bom dia':
                    client.sendMessage(receivedMessage.from, jsonMessages.wellcome);
                    break;
                default:
                    break;
            }
        }
    });
}

module.exports = { initMessages };
