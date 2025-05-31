require('dotenv').config({ path: '.env' });

const mysql = require('mysql2');
const bcrypt = require('bcrypt');


const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Erro: A variável de ambiente ${envVar} não está definida.`);
        process.exit(1);
    }
}

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function encriptarSenha(senha) {
    const saltRounds = 10;
    return await bcrypt.hash(senha, saltRounds);
}


async function criarUsuarioAdmin(pool) {
    const nome = 'Teste Adm';
    const cpf = '12345678901';
    const email = 'teste_adm@example.com';
    const senha = '123';
    const cargoId = 1;

    try {
        const senhaHash = await encriptarSenha(senha);

        const [resultado] = await pool.query(
            'INSERT INTO colaboradores (nome, cpf, email, senha, cargo_id) VALUES (?, ?, ?, ?, ?)',
            [nome, cpf, email, senhaHash, cargoId]
        );

        console.log('Usuário administrador criado com ID:', resultado.insertId);
    } catch (err) {
        console.error('Erro ao criar usuário administrador:', err);
    }
}

async function executarQuery(query, connection) {
    try {
        const [results] = await connection.query(query);
        return results;
    } catch (err) {
        console.error('Erro ao executar query:', err);
        throw err;
    }
}

async function criarBancoDeDados(connection) {
    try {
        await executarQuery(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`, connection);
        console.log(`Banco de dados "${dbConfig.database}" criado ou já existe`);

        await executarQuery(`USE ${dbConfig.database}`, connection);
        console.log(`Usando banco de dados "${dbConfig.database}"`);
    } catch (err) {
        console.error('Erro ao criar ou usar o banco de dados:', err);
        throw err;
    }
}

// Função para criar as tabelas
async function criarTabelas(connection) {
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
        `CREATE TABLE IF NOT EXISTS clientes (
            id_cliente INT PRIMARY KEY AUTO_INCREMENT,
            nome_completo VARCHAR(255) NOT NULL,
            cpf VARCHAR(11) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            senha VARCHAR(255) NOT NULL,
            data_nascimento DATE NOT NULL,
            genero VARCHAR(20),
            status BOOLEAN DEFAULT TRUE
        );`,
        `CREATE TABLE IF NOT EXISTS enderecos (
            id_endereco INT PRIMARY KEY AUTO_INCREMENT,
            id_cliente INT NOT NULL,
            cep VARCHAR(8) NOT NULL,
            logradouro VARCHAR(255) NOT NULL,
            numero VARCHAR(10) NOT NULL,
            complemento VARCHAR(100),
            bairro VARCHAR(100) NOT NULL,
            cidade VARCHAR(100) NOT NULL,
            uf CHAR(2) NOT NULL,
            tipo ENUM('FATURAMENTO', 'ENTREGA') NOT NULL,
            padrao BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
        );`,
        `CREATE TABLE IF NOT EXISTS fretes (
            frete_id INT PRIMARY KEY AUTO_INCREMENT,
            nome VARCHAR(255) NOT NULL,
            descricao VARCHAR(2000),
            custo DECIMAL(10,2) NOT NULL,
            prazo_entrega INT
        );`,
        `CREATE TABLE IF NOT EXISTS carrinhos (
            id_carrinho INT PRIMARY KEY AUTO_INCREMENT,
            id_cliente INT,
            id_cliente_sessao VARCHAR(255),
            frete_id INT,
            FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
            FOREIGN KEY (frete_id) REFERENCES fretes(frete_id)
        );`,
        `CREATE TABLE IF NOT EXISTS itens_carrinho (
            id_item_carrinho INT PRIMARY KEY AUTO_INCREMENT,
            id_carrinho INT NOT NULL,
            produto_id INT NOT NULL,
            quantidade INT NOT NULL DEFAULT 1,
            FOREIGN KEY (id_carrinho) REFERENCES carrinhos(id_carrinho),
            FOREIGN KEY (produto_id) REFERENCES produtos(produto_id)
        );`,
        `CREATE TABLE IF NOT EXISTS sessoes (
            id_sessao  VARCHAR(255) PRIMARY KEY,
            id_cliente INT NOT NULL,
            FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente)
        );`,
        `CREATE TABLE IF NOT EXISTS pedidos (
            id_pedido INT PRIMARY KEY AUTO_INCREMENT,
            id_cliente INT NOT NULL,
            id_endereco_entrega INT,
            id_frete INT NOT NULL,
            data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            valor_total DECIMAL(10,2) NOT NULL,
            valor_frete DECIMAL(10,2) NOT NULL,
            status ENUM(
                'Pendente',
                'Aguardando Pagamento',
                'Pagamento Rejeitado',
                'Pagamento com sucesso',
                'Aguardando retirada',
                'Em transito',
                'Entregue'
                ) DEFAULT 'Pendente',
            numero_pedido VARCHAR(20) UNIQUE,
            FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
            FOREIGN KEY (id_endereco_entrega) REFERENCES enderecos(id_endereco),
            FOREIGN KEY (id_frete) REFERENCES fretes(frete_id)
        );`,
        `CREATE TABLE IF NOT EXISTS itens_pedido (
            id_item_pedido INT PRIMARY KEY AUTO_INCREMENT,
            id_pedido INT NOT NULL,
            id_produto INT NOT NULL,
            quantidade INT NOT NULL,
            preco_unitario DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
            FOREIGN KEY (id_produto) REFERENCES produtos(produto_id)
        );`,
        `CREATE TABLE IF NOT EXISTS pagamentos (
           id_pagamento INT PRIMARY KEY AUTO_INCREMENT,
           id_pedido INT NOT NULL,
           metodo ENUM('BOLETO', 'CARTAO_CREDITO') NOT NULL,
           status ENUM(
               'PENDENTE',
               'APROVADO',
               'RECUSADO',
               'ESTORNADO'
               ) DEFAULT 'PENDENTE',
           valor DECIMAL(10,2) NOT NULL,
           data_pagamento TIMESTAMP NULL,
           parcelas INT DEFAULT 1,
           FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
         );`
        // `CREATE TABLE IF NOT EXISTS cartoes_cliente (
        //     id_cartao INT PRIMARY KEY AUTO_INCREMENT,
        //     id_cliente INT NOT NULL,
        //     numero_cartao VARCHAR(20) NOT NULL,
        //     nome_titular VARCHAR(100) NOT NULL,
        //     data_validade DATE NOT NULL,
        //     cvv VARCHAR(3) NOT NULL,
        //     FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
        // );`
    ];

    try {
        for (const query of queriesCriarTabelas) {
            await executarQuery(query, connection);
        }
        console.log('Tabelas criadas ou já existem');
    } catch (err) {
        console.error('Erro ao criar tabelas:', err);
        throw err;
    }
}

// Função para inserir dados iniciais
async function inserirDadosIniciais(connection) {
    try {
        // Insere cargos iniciais
        await executarQuery(`
            INSERT IGNORE INTO cargos (nome) VALUES ('administrador'), ('estoquista');
        `, connection);

        // Insere métodos de frete iniciais
        await executarQuery(`
            INSERT IGNORE INTO fretes (nome, descricao, custo, prazo_entrega)
            VALUES 
                ('Entrega Padrão', 'Entrega em até 5 dias úteis', 10.00, 5),
                ('Entrega Expressa', 'Entrega em até 2 dias úteis', 20.00, 2),
                ('Retirada na Loja', 'Retire seu pedido na loja mais próxima', 0.00, 0);
        `, connection);

        console.log('Dados iniciais inseridos ou já existem');
    } catch (err) {
        console.error('Erro ao inserir dados iniciais:', err);
        throw err;
    }
}

// Função principal para inicializar o banco de dados
async function inicializarBancoDeDados() {
    let connection;
    try {
        // Conecta ao servidor MySQL sem especificar o banco de dados
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
        }).promise();

        console.log('Conectado ao servidor MySQL');

        // Cria o banco de dados
        await criarBancoDeDados(connection);

        // Reconecta ao banco de dados específico
        await connection.end(); // Fecha a conexão inicial
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
        }).promise();

        console.log(`Conectado ao banco de dados "${dbConfig.database}"`);

        // Cria as tabelas
        await criarTabelas(connection);

        // Insere dados iniciais
        await inserirDadosIniciais(connection);

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
        await pool.end();
        console.log('Banco de dados inicializado com sucesso!');
    } catch (err) {
        console.error('Erro durante a inicialização do banco de dados:', err);
    } finally {
        // Fecha a conexão
        if (connection) {
            await connection.end();
        }
    }
}

// Executa a função principal
inicializarBancoDeDados();