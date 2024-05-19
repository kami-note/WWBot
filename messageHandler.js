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

        this.sendMessage(userId, `Vamos começar com as suas dúvidas, segue a lista de perguntas frequentes:
        1- Quem realiza essas inspeções e aprovações?
        2- Todas as regulamentações e normas estão sendo seguidas?
        3- Qual é o procedimento para solicitar alterações?(Chamar atendente)
        4- Estamos dentro do orçamento planejado?
        5- Quais foram as variações de custo e por que ocorreram?
        6- Há despesas adicionais previstas?`);

        const response = message.body;
        switch (response) {
            case "1":
                this.sendMessage(userId, `Maicon Küster, realizas as inspeções de seguranças e 
                Flavio Kotaka, realizas as aprovações do projeto.`);
                break;  
            case "2":
                this.sendMessage(userId, `Sim, todas as regulamentações e normas estão sendo seguidas rigorosamente.
                Temos uma equipe dedicada para garantir a conformidade com todas as exigências legais e de segurança. 
                Além disso, realizamos inspeções regulares para manter a qualidade e a segurança do projeto.`);
                break;
            case "3":
                this.sendMessage(userId, `Um momento, vamos te passar para um de nossos atendentes disponiveis.`);
                break;
            case "4":
                this.sendMessage(userId, `Sim, estamos dentro do orçamento planejado. Monitoramos continuamente os custos e ajustamos conforme necessário para garantir que não haja excedentes. Se houver qualquer variação, informaremos imediatamente.`);
                break;
            case "5":
                this.sendMessage(userId,`As do Job.`);
                break;
            case "6":
                this.sendMessage(userId, `Não.`);
                break;
            default:
                this.sendMessage(userId, `Insira uma alternativa válida.`);
                break;
        }
        
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
