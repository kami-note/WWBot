const fs = require('fs');

// Read the JSON file
const jsonString = fs.readFileSync('public/messages.json', 'utf-8');

// Parse the JSON string with a reviver function
const jsonMessages = JSON.parse(jsonString, (key, value) => {
    // Ensure all values are treated as strings
    if (typeof value !== 'string') {
        return String(value);
    }
    return value;
});

const message = jsonMessages;

function initMessages(client) {
    client.on('message_create', message => {
        switch (message.body) {
            case 'ping':
                client.sendMessage(message.from, 'pong');
                break;
            case 'Bom dia':
                client.sendMessage(message.from, message.wellcome)
                break;
            default:
                client.sendMessage(message.from, message.callhumanattendant)
                break;
        }
    });
}

module.exports = { message, initMessages };
