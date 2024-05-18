const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsAppClient {
  constructor(config) {
    this.client = new Client(config);
    this.client.on('qr', qr => {
      qrcode.generate(qr, { small: true });
    });
  }

  initialize(messageHandler) {
    this.client.initialize();
    this.client.on('message', messageHandler.handleMessage.bind(messageHandler));
  }
}

module.exports = {
  WhatsAppClient,
  LocalAuth
};
