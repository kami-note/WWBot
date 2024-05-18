class MessageHandler {
    constructor(client, database) {
      this.client = client;
      this.database = database;
      this.welcomedUsers = new Set();
      this.awaitingCPFUsers = new Set();
      this.client.on('message', this.handleMessage.bind(this));
    }
  
    async handleMessage(message) {
        const senderId = message.from;
        if (!this.welcomedUsers.has(senderId)) {
          // Marcando o usuário como recebido após o envio da mensagem de boas-vindas
          this.welcomedUsers.add(senderId);
          await this.sendWelcomeMessage(senderId);
          // Adicionando usuário à lista de aguardando CPF
          this.awaitingCPFUsers.add(senderId);
        } else if (this.awaitingCPFUsers.has(senderId)) {
          // Removendo usuário da lista de aguardando CPF após processamento do CPF
          this.awaitingCPFUsers.delete(senderId);
          await this.handleCPF(senderId, message.body);
        }
    }
  
    async sendWelcomeMessage(userId) {
      const user = await this.client.getContactById(userId);
      const displayName = user ? user.name || 'Usuário' : 'Usuário';
      const welcomeMessage = `Olá, ${displayName}! Bem-vindo ao nosso chat. Por favor, digite o seu CPF.`;
      await this.client.sendMessage(userId, welcomeMessage);
    }
  
    async handleCPF(userId, cpf) {
      try {
        const { results } = await this.database.query('SELECT name FROM users WHERE cpf = ?', [cpf]);
        if (results.length > 0) {
          const userName = results[0].name;
          await this.client.sendMessage(userId, `CPF recebido com sucesso! Olá, ${userName}. Como podemos ajudar você?`);
        } else {
          await this.client.sendMessage(userId, 'CPF não encontrado. Por favor, forneça um CPF válido.');
        }
      } catch (error) {
        console.error('Erro ao consultar o banco de dados:', error);
        await this.client.sendMessage(userId, 'Ocorreu um erro ao consultar o CPF. Por favor, tente novamente mais tarde.');
      }
    }
  }
  
  module.exports = MessageHandler;
  