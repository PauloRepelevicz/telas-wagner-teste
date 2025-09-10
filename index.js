const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = process.env.PORT || 3000;

// Serve os arquivos estáticos da pasta "public"
app.use(express.static("public"));

// Configura o body-parser para ler JSON
app.use(bodyParser.json());

// Conexão com o banco de dados SQLite
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err.message);
    } else {
        console.log("Conectado ao banco de dados SQLite.");
    }
});

// Criação das tabelas
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS clientes(
        cli_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cli_nome VARCHAR(100) NOT NULL,
        cli_cpf VARCHAR(14) NOT NULL UNIQUE,
        cli_telefone VARCHAR(15),
        cli_data_nascimento DATE,
        cli_email TEXT NOT NULL,	
        cli_logradouro TEXT,
        cli_numero INTEGER,
        cli_bairro TEXT,
        cli_cidade TEXT,
        cli_estado TEXT,
        cli_cep VARCHAR(10),
        cli_complemento TEXT,
        cli_observacoes TEXT
        )
    `);
    db.run(`
    CREATE TABLE IF NOT EXISTS funcionario(
         func_id INTEGER PRIMARY KEY AUTOINCREMENT,
         func_nome VARCHAR(100) NOT NULL,
         func_cpf VARCHAR(14) NOT NULL UNIQUE,
         func_telefone VARCHAR(15),
         func_email VARCHAR(100),
         func_datanascimento DATE,
         func_genero VARCHAR(2),
         func_cargo	VARCHAR(30),
         func_logradouro TEXT,
         func_numero INTEGER,
         func_bairro TEXT,
         func_cidade TEXT,
         func_estado TEXT,
         func_cep VARCHAR(10),
         func_complemento TEXT,
         func_observacoes TEXT
         )
    `);
    db.run(`
    CREATE TABLE IF NOT EXISTS categoria(
        cat_id INTEGER PRIMARY KEY AUTOINCREMENT,
        cat_nome VARCHAR(50) NOT NULL UNIQUE,
        cat_descricao TEXT
        )
    `);
    db.run(`
    CREATE TABLE IF NOT EXISTS produto(
        prod_id INTEGER PRIMARY KEY AUTOINCREMENT,
        prod_nome TEXT NOT NULL,
        prod_codigo INTEGER UNIQUE,
        prod_descricao TEXT,
        prod_preco_venda REAL NOT NULL,
        prod_quantidade_estoque INTEGER DEFAULT 0,
        cat_nome TEXT NOT NULL,
        forn_id INTEGER,
        prod_data_validade DATE,
        prod_unidade_medida TEXT,
        prod_estoque_minimo REAL,
        FOREIGN KEY (cat_nome) REFERENCES categoria(cat_nome),
        FOREIGN KEY (forn_id) REFERENCES fornecedor(forn_id)
        )
    `);
    db.run(`
    CREATE TABLE IF NOT EXISTS fornecedor(
        forn_id INTEGER PRIMARY KEY AUTOINCREMENT,
        forn_nome TEXT NOT NULL UNIQUE,
        forn_cnpj TEXT UNIQUE,
        forn_telefone TEXT,
        forn_email TEXT,
        forn_logradouro TEXT,
        forn_numero INTEGER,
        forn_bairro TEXT,
        forn_cidade TEXT,
        forn_estado TEXT,
        forn_cep VARCHAR(10),
        forn_complemento TEXT,
        forn_observacoes TEXT
        )
    `);
    db.run(`
    CREATE TABLE IF NOT EXISTS vendas(
        ven_id INTEGER PRIMARY KEY AUTOINCREMENT,
        ven_data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
        cli_cpf INTEGER,
        prod_quantidade_estoque INTEGER,
        func_id INTEGER,
        ven_total REAL NOT NULL,
        ven_forma_pagamento TEXT,
        ven_status TEXT DEFAULT 'finalizada',
        FOREIGN KEY (cli_cpf) REFERENCES clientes(cli_cpf),
        FOREIGN KEY (prod_quantidade_estoque) REFERENCES produto(prod_quantidade_estoque)
        )
    `);

    console.log("Tabelas criadas com sucesso.");
});

///////////////////////////// Rotas para Clientes /////////////////////////////
///////////////////////////// Rotas para Clientes /////////////////////////////
///////////////////////////// Rotas para Clientes /////////////////////////////

// Cadastrar cliente //
app.post("/clientes", (req, res) => {
    console.log("Recebendo requisição de cadastro de cliente");
    const {
        nome,
        cpf,
        telefone,
        email,
        data_nascimento,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        complemento,
        observacoes,
    } = req.body;

    if (!nome || !cpf) {
        return res.status(400).send("Nome e CPF são obrigatórios.");
    }

    const query = `INSERT INTO clientes (cli_nome, cli_cpf, cli_telefone, cli_data_nascimento, cli_email, cli_logradouro, cli_numero, cli_bairro, cli_cidade, cli_estado, cli_cep, cli_complemento, cli_observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(
        query,
        [
            nome,
            cpf,
            telefone,
            data_nascimento,
            email,
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            cep,
            complemento,
            observacoes,
        ],

        function (err) {
            if (err) {
                return res.status(500).send("Erro ao cadastrar cliente.1");
            }
            res.status(201).send({
                id: this.lastID,
                message: "Cliente cadastrado com sucesso.",
            });
        },
    );
});
// Listar clientes //
// Endpoint para listar todos os clientes ou buscar por CPF
app.get("/clientes", (req, res) => {
    const cpf = req.query.cpf || ""; // Recebe o CPF da query string (se houver)
    if (cpf) {
        // Se CPF foi passado, busca clientes que possuam esse CPF ou parte dele
        const query = `SELECT * FROM clientes WHERE cli_cpf LIKE ?`;

        db.all(query, [`%${cpf}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Erro ao buscar clientes." });
            }
            res.json(rows); // Retorna os clientes encontrados ou um array vazio
        });
    } else {
        // Se CPF não foi passado, retorna todos os clientes
        const query = `SELECT * FROM clientes`;

        db.all(query, (err, rows) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Erro ao buscar clientes." });
            }
            res.json(rows); // Retorna todos os clientes
        });
    }
});

// Atualizar cliente
app.put("/clientes/cpf/:cpf", (req, res) => {
    const { cpf } = req.params;
    const {
        nome,
        telefone,
        email,
        data_nascimento,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        complemento,
        observacoes,
    } = req.body;

    const query = `UPDATE clientes SET cli_nome = ?, cli_telefone = ?, cli_email = ?, cli_data_nascimento = ?, cli_logradouro = ?, cli_numero = ?, cli_bairro = ?, cli_cidade = ?, cli_estado = ?, cli_cep = ?, cli_complemento = ?, cli_observacoes = ? WHERE cli_cpf = ?`;
    db.run(
        query,
        [
            nome,
            telefone,
            email,
            data_nascimento,
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            cep,
            complemento,
            observacoes,
            cpf,
        ],
        function (err) {
            if (err) {
                return res.status(500).send("e??Erro ao atualizar cliente.");
            }
            if (this.changes === 0) {
                return res.status(404).send("Cliente não encontrado.");
            }
            res.send("Cliente atualizado com sucesso.");
        },
    );
});

///////////////////////////// Rotas para Funcionarios /////////////////////////////
///////////////////////////// Rotas para Funcionarios /////////////////////////////
///////////////////////////// Rotas para Funcionarios /////////////////////////////

// Cadastrar funcionario
app.post("/funcionario", (req, res) => {
    console.log("Recebendo requisição de cadastro de Funcionário");
    const {
        nome,
        cpf,
        telefone,
        cargo,
        email,
        data_nascimento,
        genero,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        complemento,
        observacoes,
    } = req.body;

    if (!nome || !cpf) {
        return res.status(400).send("Nome e CPF são obrigatórios.");
    }

    const query = `INSERT INTO funcionario (func_nome, func_cpf, func_telefone, func_email, func_datanascimento, func_genero, func_cargo, func_logradouro, func_numero, func_bairro, func_cidade, func_estado, func_cep, func_complemento, func_observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(
        query,
        [
            nome,
            cpf,
            telefone,
            email,
            data_nascimento,
            genero,
            cargo,
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            cep,
            complemento,
            observacoes,
        ],

        function (err) {
            if (err) {
                return res.status(500).send("Erro ao cadastrar funcionario..");
            }
            res.status(201).send({
                id: this.lastID,
                message: "Funcionário cadastrado com sucesso.",
            });
        },
    );
});

// Listar funcionários
// Endpoint para listar todos os funcionários ou buscar por CPF
app.get("/funcionario", (req, res) => {
    const cpf = req.query.cpf || ""; // Recebe o CPF da query string (se houver)
    if (cpf) {
        // Se CPF foi passado, busca funcionários que possuam esse CPF ou parte dele
        const query = `SELECT * FROM funcionario WHERE func_cpf LIKE ?`;

        db.all(query, [`%${cpf}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Erro ao buscar funcionários." });
            }
            res.json(rows); // Retorna os funcionários encontrados ou um array vazio
        });
    } else {
        // Se CPF não foi passado, retorna todos os funcionários
        const query = `SELECT * FROM funcionario`;

        db.all(query, (err, rows) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Erro ao buscar funcionarios." });
            }
            res.json(rows); // Retorna todos os funcionários
        });
    }
});

// Atualizar funcionário
app.put("/funcionario/cpf/:cpf", (req, res) => {
    const { cpf } = req.params;
    const {
        nome,
        telefone,
        email,
        data_nascimento,
        cargo,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        complemento,
        observacoes,
    } = req.body;

    const query = `UPDATE funcionario SET func_nome = ?, func_telefone = ?, func_email = ?, func_datanascimento = ?, func_cargo = ?, func_logradouro = ?, func_numero = ?, func_bairro = ?, func_cidade = ?, func_estado = ?, func_cep = ?, func_complemento = ?, func_observacoes = ? WHERE func_cpf = ?`;
    db.run(
        query,
        [
            nome,
            telefone,
            email,
            data_nascimento,
            cargo,
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            cep,
            complemento,
            observacoes,
            cpf,
        ],
        function (err) {
            if (err) {
                return res
                    .status(500)
                    .send("Erro ao atualizar funcionário.~~~~~~");
            }
            if (this.changes === 0) {
                return res.status(404).send("Funcionário não encontrado.");
            }
            res.send("Funcionário atualizado com sucesso.");
        },
    );
});

///////////////////////////// Rotas para Fornecedores /////////////////////////////
///////////////////////////// Rotas para Fornecedores /////////////////////////////
///////////////////////////// Rotas para Fornecedores /////////////////////////////

// Cadastrar fornecedor
app.post("/fornecedor", (req, res) => {
    console.log("Recebendo requisição de cadastro de Fornecedor");

    const {
        nome,
        cnpj,
        telefone,
        email,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        complemento,
        observacoes,
    } = req.body;

    if (!nome || !cnpj) {
        return res.status(400).send("Nome e CNPJ são obrigatórios.");
    }

    const query = `INSERT INTO fornecedor (forn_nome, forn_cnpj, forn_telefone, forn_email, forn_logradouro, forn_numero, forn_bairro, forn_cidade, forn_estado, forn_cep, forn_complemento, forn_observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(
        query,
        [
            nome,
            cnpj,
            telefone,
            email,
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            cep,
            complemento,
            observacoes,
        ],

        function (err) {
            if (err) {
                return res.status(500).send("Erro ao cadastrar fornecedor.");
            }
            res.status(201).send({
                id: this.lastID,
                message: "Fornecedor cadastrado com sucesso.",
            });
        },
    );
});

// Listar FORNECEDOR
// Endpoint para listar todos os fornecedores ou buscar por CNPJ
app.get("/fornecedor", (req, res) => {
    const cnpj = req.query.cnpj || ""; // Recebe o CNPJ da query string (se houver)
        if (cnpj) {
                // Se CNPJ foi passado, busca fornecedores que possuam esse CNPJ
            const query = `SELECT * FROM fornecedor WHERE forn_cnpj LIKE ?`;

             db.all(query, [`%${cnpj}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Erro ao buscar fornecedores." });
            }
            res.json(rows); // Retorna os fornecedores encontrados ou um array vazio
        });
    } else {
        // Se CNPJ não foi passado, retorna todos os fornecedores
        const query = `SELECT * FROM fornecedor`;

        db.all(query, (err, rows) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Erro ao buscar fornecedores." });
            }
            res.json(rows); // Retorna todos os fornecedores
        });
    }
});

// Atualizar fornecedor
app.put("/fornecedor/cnpj/:cnpj", (req, res) => {
    const { cnpj } = req.params;
    const {
        nome,
        telefone,
        email,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        complemento,
        observacoes,
    } = req.body;

    const query = `UPDATE fornecedor SET forn_nome = ?, forn_telefone = ?, forn_email = ?, forn_logradouro = ?, forn_numero = ?, forn_bairro = ?, forn_cidade = ?, forn_estado = ?, forn_cep = ?, forn_complemento = ?, forn_observacoes = ? WHERE forn_cnpj = ?`;
    db.run(
        query,
        [
            nome,
            telefone,
            email,
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            cep,
            complemento,
            observacoes,
            cnpj,
        ],
        function (err) {
            if (err) {
                return res
                    .status(500)
                    .send("EEEEEErro ao atualizar fornecedor.111111111");
            }
            if (this.changes === 0) {
                return res.status(404).send("fornecedor não encontrado.");
            }
            res.send("fornecedor atualizado com sucesso.");
        },
    );
});

////////////////////////// Rotas para Produtos /////////////////////////////
////////////////////////// Rotas para Produtos /////////////////////////////
////////////////////////// Rotas para Produtos /////////////////////////////

//Cadastrar produto
app.post("/produto", (req, res) => {
    console.log("Recebendo requisição de cadastro de Produto");
    const {
        nome,
        codigo,
        venda,
        descricao,
        categoria,
        quantidade_estoque,
        unidade_medida,
        estoque_emergencia,
        fornecedor,
    } = req.body;

    if (!nome || !categoria) {
        return res.status(400).send("Nome e Categoria são obrigatórios.");
    }

    const query = `INSERT INTO produto (prod_nome, prod_codigo, prod_preco_venda, prod_descricao, cat_nome, prod_quantidade_estoque, prod_unidade_medida, prod_estoque_minimo, forn_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(
        query,
        [
            nome,
            codigo,
            venda,
            descricao,
            categoria,
            quantidade_estoque,
            unidade_medida,
            estoque_emergencia,
            fornecedor,
        ],

        function (err) {
            if (err) {
                return res
                    .status(500)
                    .send("Erro ao cadastrar produto..?!?!?!?!?");
            }
            res.status(201).send({
                id: this.lastID,
                message: "Produto cadastrado com sucesso.",
            });
        },
    );
});

// ROTA PARA BUSCAR TODOS OS FORNECEDORES PARA CADASTRAR O PRODUTO
app.get("/buscar-fornecedores", (req, res) => {
    db.all("SELECT forn_nome FROM fornecedor", [], (err, rows) => {
        if (err) {
            console.error("Erro ao buscar serviços:", err);
            res.status(500).send("Erro ao buscar serviços");
        } else {
            res.json(rows); // Retorna os serviços em formato JSON
        }
    });
});

// Listar PRODUTO
// Endpoint para listar todos os produtos ou buscar por ID
app.get("/produto", (req, res) => {
    const id = req.query.prod_id || ""; // Recebe o ID da query string (se houver)
    if (id) {
        // Se ID foi passado, busca produtos que possuam esse ID ?`;

        db.all(query, [`%${id}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Erro ao buscar produtosindex.js." });
            }
            res.json(rows); // Retorna os produtos encontrados ou um array vazio
        });
    } else {
        // Se ID não foi passado, retorna todos os produtos
        const query = `SELECT
                            produto.prod_id,
                            produto.prod_nome,
                            produto.prod_codigo,
                            produto.prod_preco_venda,
                            produto.prod_quantidade_estoque,
                            produto.cat_nome,
                            fornecedor.forn_nome AS forn_nome
                            FROM produto
                            JOIN fornecedor ON produto.forn_id = fornecedor.forn_id
                            WHERE 1=1`;

        db.all(query, (err, rows) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ message: "Erro ao buscar produtosindex." });
            }
            res.json(rows); // Retorna todos os Produtos
        });
    }
});

// Atualizar produto
app.put("/produto/codigo/:codigo", (req, res) => {
    const { codigo } = req.params;
    const {
        nome,
        venda,
        descricao,
        categoria,
        quantidade_estoque,
        unidade_medida,
        estoque_emergencia,
        fornecedor,
    } = req.body;

    const query = `UPDATE produto SET prod_nome = ?, prod_preco_venda = ?, prod_descricao = ?, cat_nome = ?, prod_quantidade_estoque = ?, prod_unidade_medida = ?,                    prod_estoque_minimo = ?, forn_id = ? WHERE prod_codigo = ?`;
    db.run(
        query,
        [
            nome,
            venda,
            descricao,
            categoria,
            quantidade_estoque,
            unidade_medida,
            estoque_emergencia,
            fornecedor,
            codigo,
        ],
        function (err) {
            if (err) {
                return res
                    .status(500)
                    .send("EEEEEErro ao atualizar PRODUTO.JS");
            }
            if (this.changes === 0) {
                return res.status(404).send("fornecedor não encontrado.");
            }
            res.send("fornecedor atualizado com sucesso.");
        },
    );
});

///////////////////////////// Rotas para Vendas /////////////////////////////
///////////////////////////// Rotas para Vendas /////////////////////////////
///////////////////////////// Rotas para Vendas /////////////////////////////

app.post("/vendas", (req, res) => {
    const { cliente_cpf, itens } = req.body;

    if (!cliente_cpf || !itens || itens.length === 0) {
        return res.status(400).send("Dados da venda incompletos.");
    }

    const dataVenda = new Date().toISOString();

    db.serialize(() => {
        const insertSaleQuery = `INSERT INTO vendas (cli_cpf, prod_id, prod_quantidade_estoque, ven_data_hora) VALUES (?, ?, ?, ?)`;
        const updateStockQuery = `UPDATE produto SET prod_quantidade_estoque = prod_quantidade_estoque - ? WHERE ven_id = ?`;

        let erroOcorrido = false;

        itens.forEach(({ idProduto, quantidade }) => {
            if (!idProduto || !quantidade || quantidade <= 0) {
                console.error(
                    `Dados inválidos para o produto ID: ${idProduto}, quantidade: ${quantidade}`,
                );
                erroOcorrido = true;
                return;
            }

            // Registrar a venda
            db.run(
                insertSaleQuery,
                [cliente_cpf, idProduto, quantidade, dataVenda],
                function (err) {
                    if (err) {
                        console.error("Erro ao registrar venda:", err.message);
                        erroOcorrido = true;
                    }
                },
            );

            // Atualizar o estoque
            db.run(updateStockQuery, [quantidade, idProduto], function (err) {
                if (err) {
                    console.error("Erro ao atualizar estoque:", err.message);
                    erroOcorrido = true;
                }
            });
        });

        if (erroOcorrido) {
            res.status(500).send("Erro ao processar a venda.");
        } else {
            res.status(201).send({ message: "Venda registrada com sucesso." });
        }
    });
});

app.get("/clientes/:cpf", (req, res) => {
    const cpf = req.params.cpf;
    db.get("SELECT * FROM clientes WHERE cli_cpf = ?", [cpf], (err, row) => {
        if (err) {
            res.status(500).json({ error: "Erro no servidor." });
        } else if (!row) {
            res.status(404).json({ error: "Cliente não encontrado." });
        } else {
            res.json(row);
        }
    });
});
app.get("/produtos_carrinho/:id", (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM produtos WHERE id = ? ", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: "Erro no servidor." });
        } else if (!row) {
            res.status(404).json({ error: "Produto não encontrado.." });
        } else {
            res.json(row);
        }
    });
});

// ROTA PARA BUSCAR TODOS OS PRODUTOS PÁGINA DE VENDAS
app.get("/buscar-produtos", (req, res) => {
    db.all(
        "SELECT prod_nome, prod_codigo, prod_quantidade_estoque FROM produto",
        [],
        (err, rows) => {
            if (err) {
                console.error("Erro ao buscar produtos:", err);
                res.status(500).send("Erro ao buscar produtos");
            } else {
                res.json(rows); // Retorna os serviços em formato JSON
            }
        },
    );
});


    ///////////////////////////// FIM /////////////////////////////
    ///////////////////////////// FIM /////////////////////////////
    ///////////////////////////// FIM /////////////////////////////

    // Teste para verificar se o servidor está rodando
    app.get('/', (req, res) => {
        res.send('Servidor está rodando e tabelas criadas!');
    });

    // Iniciando o servidor
    app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
    });