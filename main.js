const Database = require('./database');
const MessageHandler = require('./messageHandler');
const {Client, LocalAuth} = require('whatsapp-web.js'); 

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'querycompany'
};

const db = new Database(dbConfig);

const client = new Client({
  webVersion: '2.2409.2',
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2409.2.html'
  },
  authStrategy: new LocalAuth()
});
const messageHandler = new MessageHandler(client, db);

(async () => {
  try {
    await db.connect();
    client.initialize(messageHandler);
  } catch (error) {
    console.error('Error initializing the client or connecting to the database:', error);
  }
})();
