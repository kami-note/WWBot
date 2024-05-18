const Database = require('./database');
const MessageHandler = require('./messageHandler');
const { WhatsAppClient, LocalAuth } = require('./whatsappClient');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'querycompany'
};

const db = new Database(dbConfig);
const clientConfig = {
  webVersion: '2.2409.2',
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2409.2.html'
  },
  authStrategy: new LocalAuth()
};
const client = new WhatsAppClient(clientConfig);
const messageHandler = new MessageHandler(client.client, db);

(async () => {
  await db.connect();
  client.initialize(messageHandler);
})();
