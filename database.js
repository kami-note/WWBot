const mysql = require('mysql2');

class Database {
  constructor(config) {
    this.connection = mysql.createConnection(config);
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.connection.connect(err => {
        if (err) {
          console.error('Erro ao conectar ao banco de dados:', err);
          reject(err);
        } else {
          console.log('Conexão com o banco de dados MySQL estabelecida com sucesso!');
          resolve();
        }
      });
    });
  }

  query(sql, params) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, results, fields) => {
        if (err) {
          console.error('Erro ao consultar o banco de dados:', err);
          reject(err);
        } else {
          resolve({ results, fields });
        }
      });
    });
  }
}

module.exports = Database;
