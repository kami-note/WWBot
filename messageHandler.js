class MessageHandler {
    constructor(client, database) {
        this.client = client;
        this.database = database;
        this.users = new Map(); 
        this.stages = {
            WELCOME: 1,
            CPF: 2,
            THIRD: 3,
            
        };
        this.processedMessages = new Set(); 
        this.client.on('message', (message) => {
            console.log('Nova mensagem recebida:', message);
            const messageKey = `${message.from}_${message.body}`; 
        
            
            if (this.processedMessages.has(messageKey)) {
                console.log('Mensagem duplicada detectada. Descartando.');
                return;
            }
        
            
            this.processedMessages.add(messageKey);
            this.handleMessage(message);
        });
    }

    

    handleWelcomeMessage(userId) {
        this.sendWelcomeMessage(userId);
        this.users.set(userId, this.stages.CPF);
    }

    async handleCPF(userId, cpf) {
        try {
            const userName = await this.getUserNameFromCPF(cpf);
            if (userName) {
                this.sendMessage(userId, `CPF recebido com sucesso! Olá, ${userName}. Digite o próximo passo.`);
                
                this.users.set(userId, this.stages.THIRD);
            } else {
                this.sendMessage(userId, 'CPF não encontrado. Por favor, forneça um CPF válido.');
            }
        } catch (error) {
            console.error('Erro ao consultar o banco de dados:', error);
            this.sendMessage(userId, 'Ocorreu um erro ao consultar o CPF. Por favor, tente novamente mais tarde.');
        }
    }

    handleThirdStage(userId, message) {
        
        this.sendMessage(userId, "Você está no terceiro estágio!");
        
    }

    

    sendWelcomeMessage(userId) {
        const displayName = this.getUserName(userId);
        const welcomeMessage = `Olá, ${displayName}! Bem-vindo ao nosso chat. Por favor, digite o seu CPF.`;
        this.sendMessage(userId, welcomeMessage);
    }

    sendMessage(userId, message) {
        this.client.sendMessage(userId, message);
    }

    

    async getUserNameFromCPF(cpf) {
        try {
            const { results } = await this.database.query('SELECT name FROM users WHERE cpf = ?', [cpf]);
            return results.length > 0 ? results[0].name : null;
        } catch (error) {
            console.error('Erro ao consultar o banco de dados:', error);
            throw error;
        }
    }

    

    getUserName(userId) {
        const user = this.client.getContactById(userId);
        return user ? user.name || 'Usuário' : 'Usuário';
    }

    logMessage(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp}: From: ${message.from}, Body: ${message.body}\n`;
        fs.appendFile('message_log.txt', logEntry, (err) => {
            if (err) {
                console.error('Erro ao registrar mensagem no log:', err);
            }
        });
    }

    

    handleMessage(message) {
        const senderId = message.from;
    
        if (!this.users.has(senderId)) {
            console.log('Usuário não recebeu as boas-vindas ainda. Tratando a mensagem como uma mensagem de boas-vindas.');
            this.handleWelcomeMessage(senderId);
        } else {
            console.log('Usuário está em um estágio interativo. Tratando a mensagem de acordo com o estágio atual.');
            const stage = this.users.get(senderId);
            switch (stage) {
                case this.stages.CPF:
                    console.log('Tratando mensagem para o estágio do CPF.');
                    this.handleCPF(senderId, message.body);
                    break;
                case this.stages.THIRD:
                    console.log('Tratando mensagem para o terceiro estágio.');
                    this.handleThirdStage(senderId, message.body);
                    break;
                
                default:
                    break;
            }
        }
        
        this.logMessage(message);
    }
}

module.exports = MessageHandler;
