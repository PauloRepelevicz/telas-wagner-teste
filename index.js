const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();


const app = express();
const port = process.env.PORT || 3000;

// Serve os arquivos estáticos da pasta "public"
app.use(express.static('public'));

// Configura o body-parser para ler JSON
app.use(bodyParser.json());

// Conexão com o banco de dados SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});
db.run('PRAGMA foreign_keys = ON;');

// Criação das tabelas
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS fornecedores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            telefone TEXT,
            email TEXT,
            cnpj TEXT NOT NULL UNIQUE,
            endereco TEXT
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            preco REAL NOT NULL,
            descricao TEXT,
            categoria TEXT,
            quantidade_estoque INTEGER NOT NULL,
            dimensoes TEXT,
            fornecedor_id INTEGER,
            FOREIGN KEY (fornecedor_id) REFERENCES fornecedores (id)
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            cpf TEXT NOT NULL UNIQUE,
            email TEXT,
            telefone TEXT,
            endereco TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS vendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_cpf TEXT NOT NULL,
            produto_id INTEGER NOT NULL,
            quantidade INTEGER NOT NULL,
            data TEXT NOT NULL,
            FOREIGN KEY (cliente_cpf) REFERENCES clientes (cpf),
            FOREIGN KEY (produto_id) REFERENCES produtos (id)
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS servicos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome VARCHAR(100) NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS agendamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data DATE NOT NULL,
            horario TIME NOT NULL,
            cpf_cliente VARCHAR(11) NOT NULL,
            cnpj_fornecedor VARCHAR(14) NOT NULL,
            id_servico INTEGER NOT NULL,
            FOREIGN KEY (cpf_cliente) REFERENCES clientes (cpf),
            FOREIGN KEY (cnpj_fornecedor) REFERENCES fornecedores (cnpj),
            FOREIGN KEY (id_servico) REFERENCES servicos (id)
        )
    `);


    console.log('Tabelas criadas com sucesso.');
});



///////////////////////////// Rotas para Fornecedores /////////////////////////////
///////////////////////////// Rotas para Fornecedores /////////////////////////////
///////////////////////////// Rotas para Fornecedores /////////////////////////////

// Cadastrar fornecedor
app.post('/fornecedores', (req, res) => {
    const { nome, telefone, email, cnpj, endereco } = req.body;

    if (!nome || !cnpj) {
        return res.status(400).send('Nome e CNPJ são obrigatórios.');
    }

    const query = `INSERT INTO fornecedores (nome, telefone, email, cnpj, endereco) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [nome, telefone, email, cnpj, endereco], function (err) {
        if (err) {
            return res.status(500).send('Erro ao cadastrar fornecedor.');
        }
        res.status(201).send({ id: this.lastID, message: 'Fornecedor cadastrado com sucesso.' });
    });
});

// Listar fornecedores
app.get('/fornecedores', (req, res) => {
    const query = `SELECT * FROM fornecedores`;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).send('Erro ao listar fornecedores.');
        }
        res.send(rows);
    });
});


// Atualizar fornecedor
app.put('/fornecedores/cnpj/:cnpj', (req, res) => {
    const { cnpj } = req.params;
    const { nome, telefone, email, endereco } = req.body;

    const query = `UPDATE fornecedores SET nome = ?, telefone = ?, email = ?, endereco = ? WHERE cnpj = ?`;
    db.run(query, [nome, telefone, email, endereco, cnpj], function (err) {
        if (err) {
            return res.status(500).send('Erro ao atualizar fornecedor.');
        }
        if (this.changes === 0) {
            return res.status(404).send('Fornecedor não encontrado.');
        }
        res.send('Fornecedor atualizado com sucesso.');
    });
});

// Listar fornecedores
// Endpoint para listar todos os fornecedores ou buscar por cnpj
app.get('/fornecedores', (req, res) => {
    const cnpj = req.query.cnpj || '';  // Recebe o cnpj da query string (se houver)

    if (cnpj) {
        // Se cnpj foi passado, busca fornecedores que possuam esse cnpj ou parte dele
        const query = `SELECT * FROM fornecedores WHERE cnpj LIKE ?`;

        db.all(query, [`%${cnpj}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Erro ao buscar fornecedores.' });
            }
            res.json(rows);  // Retorna os fornecedores encontrados ou um array vazio
        });
    } else {
        // Se cnpj não foi passado, retorna todos os fornecedores
        const query = `SELECT * FROM fornecedores`;

        db.all(query, (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Erro ao buscar fornecedores.' });
            }
            res.json(rows);  // Retorna todos os fornecedores
        });
    }
});



///////////////////////////// Rotas para Produtos /////////////////////////////
///////////////////////////// Rotas para Produtos /////////////////////////////
///////////////////////////// Rotas para Produtos /////////////////////////////

// Cadastrar produto
app.post('/produtos', (req, res) => {
    const { nome, preco, descricao, categoria, quantidade_estoque, dimensoes, fornecedor_id } = req.body;
    const sql = `INSERT INTO produtos (nome, preco, descricao, categoria, quantidade_estoque, dimensoes, fornecedor_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [nome, preco, descricao, categoria, quantidade_estoque, dimensoes, fornecedor_id], function(err) {
        if (err) {
            return res.status(500).json({ message: "Erro ao cadastrar produto", error: err });
        }
        res.status(200).json({ message: "Produto cadastrado com sucesso", id: this.lastID });
    });
});

// Listar produtos
app.get('/produtos', (req, res) => {
    const query = `SELECT * FROM produtos`;

    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).send('Erro ao listar produtos.');
        }
        res.send(rows);
    });
});

// Atualizar produto
app.put('/produtos/:id', (req, res) => {
    const { id } = req.params;
    const { nome, preco, descricao, categoria, quantidade_estoque, dimensoes, fornecedor_id } = req.body;

    const query = `UPDATE produtos SET nome = ?, preco = ?, descricao = ?, categoria = ?, quantidade_estoque = ?, dimensoes = ?, fornecedor_id = ? WHERE id = ?`;
    db.run(query, [nome, preco, descricao, categoria, quantidade_estoque, dimensoes, fornecedor_id, id], function (err) {
        if (err) {
            return res.status(500).send('Erro ao atualizar produto.');
        }
        if (this.changes === 0) {
            return res.status(404).send('Produto não encontrado.');
        }
        res.send('Produto atualizado com sucesso.');
    });
});
// ROTA PARA BUSCAR TODOS OS FORNECEDORES PARA CADASTRAR O PRODUTO
app.get('/buscar-fornecedores', (req, res) => {
    db.all("SELECT id, nome FROM fornecedores", [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar serviços:', err);
            res.status(500).send('Erro ao buscar serviços');
        } else {
            res.json(rows); // Retorna os serviços em formato JSON
        }
    });
});




///////////////////////////// Rotas para Clientes /////////////////////////////
///////////////////////////// Rotas para Clientes /////////////////////////////
///////////////////////////// Rotas para Clientes /////////////////////////////

// Cadastrar cliente
app.post('/clientes', (req, res) => {
    const { nome, cpf, email, telefone, endereco } = req.body;

    if (!nome || !cpf) {
        return res.status(400).send('Nome e CPF são obrigatórios.');
    }

    const query = `INSERT INTO clientes (nome, cpf, email, telefone, endereco) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [nome, cpf, email, telefone, endereco], function (err) {
        if (err) {
            return res.status(500).send('Erro ao cadastrar cliente.');
        }
        res.status(201).send({ id: this.lastID, message: 'Cliente cadastrado com sucesso.' });
    });
});

// Listar clientes
// Endpoint para listar todos os clientes ou buscar por CPF
app.get('/clientes', (req, res) => {
    const cpf = req.query.cpf || '';  // Recebe o CPF da query string (se houver)

    if (cpf) {
        // Se CPF foi passado, busca clientes que possuam esse CPF ou parte dele
        const query = `SELECT * FROM clientes WHERE cpf LIKE ?`;

        db.all(query, [`%${cpf}%`], (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Erro ao buscar clientes.' });
            }
            res.json(rows);  // Retorna os clientes encontrados ou um array vazio
        });
    } else {
        // Se CPF não foi passado, retorna todos os clientes
        const query = `SELECT * FROM clientes`;

        db.all(query, (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Erro ao buscar clientes.' });
            }
            res.json(rows);  // Retorna todos os clientes
        });
    }
});



// Atualizar cliente
app.put('/clientes/cpf/:cpf', (req, res) => {
    const { cpf } = req.params;
    const { nome, email, telefone, endereco } = req.body;

    const query = `UPDATE clientes SET nome = ?, email = ?, telefone = ?, endereco = ? WHERE cpf = ?`;
    db.run(query, [nome, email, telefone, endereco, cpf], function (err) {
        if (err) {
            return res.status(500).send('Erro ao atualizar cliente.');
        }
        if (this.changes === 0) {
            return res.status(404).send('Cliente não encontrado.');
        }
        res.send('Cliente atualizado com sucesso.');
    });
});



///////////////////////////// Rotas para Vendas /////////////////////////////
///////////////////////////// Rotas para Vendas /////////////////////////////
///////////////////////////// Rotas para Vendas /////////////////////////////

app.post('/vendas', (req, res) => {
    const { cliente_cpf, itens } = req.body;

    if (!cliente_cpf || !itens || itens.length === 0) {
        return res.status(400).send("Dados da venda incompletos.");
    }

    const dataVenda = new Date().toISOString();

    db.serialize(() => {
        const insertSaleQuery = `INSERT INTO vendas (cliente_cpf, produto_id, quantidade, data) VALUES (?, ?, ?, ?)`;
        const updateStockQuery = `UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?`;

        let erroOcorrido = false;

        itens.forEach(({ idProduto, quantidade }) => {
            if (!idProduto || !quantidade || quantidade <= 0) {
                console.error(`Dados inválidos para o produto ID: ${idProduto}, quantidade: ${quantidade}`);
                erroOcorrido = true;
                return;
            }

            // Registrar a venda
            db.run(insertSaleQuery, [cliente_cpf, idProduto, quantidade, dataVenda], function (err) {
                if (err) {
                    console.error("Erro ao registrar venda:", err.message);
                    erroOcorrido = true;
                }
            });

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




app.get('/clientes/:cpf', (req, res) => {
    const cpf = req.params.cpf;
    db.get("SELECT * FROM clientes WHERE cpf = ?", [cpf], (err, row) => {
      if (err) {
        res.status(500).json({ error: "Erro no servidor." });
      } else if (!row) {
        res.status(404).json({ error: "Cliente não encontrado." });
      } else {
        res.json(row);
      }
    });
});
app.get('/produtos_carrinho/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM produtos WHERE id = ? ", [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: "Erro no servidor." });
        } else if (!row) {
          res.status(404).json({ error: "Produto não encontrado.." });
        } else {
          res.json(row);
        }
      }
    );
});





// ROTA PARA BUSCAR TODOS OS PRODUTOS PÁGINA DE VENDAS
app.get('/buscar-produtos', (req, res) => {
    db.all("SELECT id, nome, quantidade_estoque FROM produtos", [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            res.status(500).send('Erro ao buscar produtos');
        } else {
            res.json(rows); // Retorna os serviços em formato JSON
        }
    });
});

///////////////////////////// Rotas para consulta /////////////////////////////
///////////////////////////// Rotas para consulta /////////////////////////////
///////////////////////////// Rotas para consulta /////////////////////////////



// Rota para buscar vendas com filtros (cpf, produto, data)
app.get('/relatorios', (req, res) => {
    const { cpf, produto, dataInicio, dataFim } = req.query;

    let query = `SELECT
                    vendas.id,
                    vendas.cliente_cpf,
                    vendas.produto_id,
                    vendas.quantidade,
                    vendas.data, 
                    produtos.nome AS produto_nome,
                    clientes.nome AS cliente_nome
                 FROM vendas
                 JOIN produtos ON vendas.produto_id = produtos.id
                 JOIN clientes ON vendas.cliente_cpf = clientes.cpf
                 WHERE 1=1`;  // Começar com um WHERE sempre verdadeiro (1=1)

    const params = [];

    // Filtro por CPF do cliente
    if (cpf) {
        query += ` AND vendas.cliente_cpf = ?`;
        params.push(cpf);
    }

    // Filtro por nome do produto
    if (produto) {
        query += ` AND produtos.nome LIKE ?`;
        params.push(`%${produto}%`);
    }

    // Filtro por data
    if (dataInicio && dataFim) {
        query += ` AND vendas.data BETWEEN ? AND ?`;
        params.push(dataInicio, dataFim);
    }

    // Executa a query com os filtros aplicados
    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao buscar relatórios.', error: err.message });
        }

        res.json(rows);  // Retorna os resultados da query
    });
});


///////////////////////////// Rotas para servico /////////////////////////////
///////////////////////////// Rotas para servico /////////////////////////////
///////////////////////////// Rotas para servico /////////////////////////////


// ROTA PRA CADASTRAR UM SERVIÇO
app.post('/cadastrar-servico', (req, res) => {
    const { nome } = req.body;
    db.run("INSERT INTO servicos (nome) VALUES (?)", [nome], function (err) {
        if (err) {
            console.error('Erro ao cadastrar serviço:', err);
            res.status(500).send('Erro ao cadastrar serviço');
        } else {
            res.send('Serviço cadastrado com sucesso!');
        }
    });
});

///////////////////////////// Rotas para Agendamento /////////////////////////////
///////////////////////////// Rotas para Agendamento /////////////////////////////
///////////////////////////// Rotas para Agendamento /////////////////////////////

// ROTA PARA BUSCAR TODOS OS SERVIÇOS NO ATENDAMENTO
app.get('/buscar-servicos', (req, res) => {
    db.all("SELECT id, nome FROM servicos", [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar serviços:', err);
            res.status(500).send('Erro ao buscar serviços');
        } else {
            res.json(rows); // Retorna os serviços em formato JSON
        }
    });
});

// ROTA PARA BUSCAR HORÁRIOS DISPONÍVEIS
app.get('/horarios-disponiveis', (req, res) => {
    const { data, id } = req.query; // id = id do serviço
  
    const todosHorarios = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'];
  
    const sql = `SELECT horario FROM agendamentos WHERE data = ? AND id_servico = ?`;
  
    db.all(sql, [data, id], (err, rows) => {
      if (err) {
        console.error('Erro ao buscar horários ocupados:', err);
        return res.status(500).send('Erro ao buscar horários ocupados');
      }
  
      const ocupados = rows.map(r => String(r.horario).slice(0,5));
      const disponiveis = todosHorarios.filter(h => !ocupados.includes(h));
      res.json(disponiveis);
    });
  });

// ROTA PRA CADASTRAR UM AGENDAMENTO
app.post('/cadastrar-agendamento', (req, res) => {
    const { data, horario, cpf_cliente, cnpj_fornecedor, id_servico } = req.body;
    db.run("INSERT INTO agendamentos (data, horario, cpf_cliente, cnpj_fornecedor, id_servico) VALUES (?, ?, ?, ?, ?)",
        [data, horario, cpf_cliente, cnpj_fornecedor, id_servico], function (err) {
        if (err) {
            console.error('Erro ao cadastrar agendamento:', err);
            res.status(500).send('Erro ao cadastrar agendamento');
        } else {
            res.send('Agendamento cadastrado com sucesso!');
        }
    });
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

