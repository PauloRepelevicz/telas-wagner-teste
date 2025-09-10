async function cadastrarProduto(event) {
    event.preventDefault();

    const produto = {
        nome: document.getElementById("nome").value,
        preco: parseFloat(document.getElementById("preco").value),
        descricao: document.getElementById("descricao").value,
        categoria: document.getElementById("categoria").value,
        quantidade_estoque: parseInt(document.getElementById("quantidade_estoque").value),
        dimensoes: document.getElementById("dimensoes").value,
        fornecedor_id: parseInt(document.getElementById("fornecedoresSelecionado").value)
    };
    alert('fornecedor_id');

    try {
        const response = await fetch('/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(produto)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Produto cadastrado com sucesso!");
            document.getElementById("produto-form").reset();
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar produto.");
    }
}
function buscarFornededores() {
    fetch('/buscar-fornecedores')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar fornecedores');
            }
            return response.json();
        })
        .then(servicos => {
            const select = document.getElementById('fornecedoresSelecionado');
            servicos.forEach(servico => {
                const option = document.createElement('option');
                option.value = servico.id; // Usa o id como valor
                option.textContent = servico.nome; // Nome do serviço exibido
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar os serviços:', error);
        });
}
async function listarProdutos() {
    try {
        const response = await fetch('/produtos');

        if (response.ok) {
            const produtos = await response.json();

            const tabela = document.getElementById('tabela-clientes');
            tabela.innerHTML = ''; // Limpa a tabela antes de preencher

            produtos.forEach(produto => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${produto.id}</td>
                    <td>${produto.nome}</td>
                    <td>${produto.preco.toFixed(2)}</td>
                    <td>${produto.quantidade_estoque}</td>
                `;
                tabela.appendChild(linha);
            });
        } else {
            alert('Erro ao listar produtos.');
        }
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        alert('Erro ao listar produtos.');
    }
}