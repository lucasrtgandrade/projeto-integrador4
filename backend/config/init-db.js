// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config({ path: './.env' });

const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // Para hashing de senha

// Configurações do banco de dados a partir do .env
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// Cria uma conexão com o servidor MySQL
const connection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
});

// Função para hashear a senha
async function encriptarSenha(senha) {
    const saltRounds = 10;
    return await bcrypt.hash(senha, saltRounds);
}

// Função para criar o usuário administrador
async function criarUsuarioAdmin(pool) {
    const nome = 'Teste Adm';
    const cpf = '12345678901';
    const email = 'teste_adm@example.com';
    const senha = '123';
    const cargoId = 1; // ID do cargo 'administrador'

    try {
        // Hashear a senha
        const senhaHash = await encriptarSenha(senha);

        // Inserir o usuário administrador
        const [resultado] = await pool.query(
            'INSERT INTO colaboradores (nome, cpf, email, senha, cargo_id) VALUES (?, ?, ?, ?, ?)',
            [nome, cpf, email, senhaHash, cargoId]
        );

        console.log('Usuário administrador criado com ID:', resultado.insertId);
    } catch (err) {
        console.error('Erro ao criar usuário administrador:', err);
    }
}

// Função para executar queries SQL
async function executarQuery(query) {
    return new Promise((resolve, reject) => {
        connection.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

// Conecta ao servidor MySQL e inicializa o banco de dados
connection.connect(async (err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }

    console.log('Conectado ao servidor MySQL');

    try {
        // Cria o banco de dados
        await executarQuery(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        console.log(`Banco de dados "${dbConfig.database}" criado ou já existe`);

        // Usa o banco de dados criado
        await executarQuery(`USE ${dbConfig.database}`);
        console.log(`Usando banco de dados "${dbConfig.database}"`);

        // Cria as tabelas
        const queriesCriarTabelas = [
            `CREATE TABLE IF NOT EXISTS cargos (
        id_cargo INT PRIMARY KEY AUTO_INCREMENT,
        nome VARCHAR(255) NOT NULL
      );`,
            `CREATE TABLE IF NOT EXISTS colaboradores (
        colaborador_id INT PRIMARY KEY AUTO_INCREMENT,
        nome VARCHAR(50) NOT NULL,
        cpf VARCHAR(11) NOT NULL,
        email VARCHAR(255) NOT NULL,
        senha VARCHAR(255) NOT NULL,
        status BOOLEAN DEFAULT TRUE,
        cargo_id INT NOT NULL,
        FOREIGN KEY (cargo_id) REFERENCES cargos(id_cargo)
      );`,
            `CREATE TABLE IF NOT EXISTS produtos (
        produto_id INT PRIMARY KEY AUTO_INCREMENT,
        nome VARCHAR(200) NOT NULL,
        descricao VARCHAR(2000) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        media_avaliacao DECIMAL(2,1) DEFAULT 0.0,
        total_avaliacao INT DEFAULT 0,
        qtd_estoque INT NOT NULL,
        status BOOLEAN DEFAULT TRUE,
        colaborador_id INT,
        FOREIGN KEY (colaborador_id) REFERENCES colaboradores(colaborador_id)
      );`,
            `CREATE TABLE IF NOT EXISTS imagens (
        imagem_id INT PRIMARY KEY AUTO_INCREMENT,
        url VARCHAR(255),
        is_principal BOOLEAN DEFAULT FALSE,
        produto_id INT,
        FOREIGN KEY (produto_id) REFERENCES produtos(produto_id)
      );`,
            `CREATE TABLE IF NOT EXISTS avaliacoes (
        avaliacao_id INT PRIMARY KEY AUTO_INCREMENT,
        avaliacao DECIMAL(2,1) NOT NULL CHECK (avaliacao IN (1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0)),
        produto_id INT,
        FOREIGN KEY (produto_id) REFERENCES produtos(produto_id)
      );`,
        ];

        for (const query of queriesCriarTabelas) {
            await executarQuery(query);
        }
        console.log('Tabelas criadas ou já existem');

        // Insere dados iniciais (e.g., cargos)
        await executarQuery(`
      INSERT IGNORE INTO cargos (nome) VALUES ('administrador'), ('estoquista');
    `);
        console.log('Dados iniciais inseridos ou já existem');

        // Cria um pool de conexões para criar o usuário administrador
        const pool = mysql.createPool({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        }).promise();

        // Cria o usuário administrador
        await criarUsuarioAdmin(pool);

        // Fecha o pool de conexões
        pool.end();
        connection.end(); // Fecha a conexão inicial
    } catch (err) {
        console.error('Erro durante a inicialização do banco de dados:', err);
    }
});