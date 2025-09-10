async function cadastrarFornecedor(event) {
    event.preventDefault();

    const fornecedor = {
        nome: document.getElementById("nome").value,
        telefone: document.getElementById("telefone").value,
        email: document.getElementById("email").value,
        cnpj: document.getElementById("cnpj").value,
        endereco: document.getElementById("endereco").value
    };

    try {
        const response = await fetch('/fornecedores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fornecedor)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Fornecedor cadastrado com sucesso!");
            document.getElementById("fornecedor-form").reset();
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar fornecedor.");
    }
}
// Função para listar todos os fornecedores ou buscar fornecedores por cnpj
async function listarFornecedores() {
    const cnpj = document.getElementById('cnpj').value.trim();  // Pega o valor do cnpj digitado no input

    let url = '/fornecedores';  // URL padrão para todos os fornecedores

    if (cnpj) {
        // Se cnpj foi digitado, adiciona o parâmetro de consulta
        url += `?cnpj=${cnpj}`;
    }

    try {
        const response = await fetch(url);
        const fornecedores = await response.json();

        const tabela = document.getElementById('tabela-fornecedores');
        tabela.innerHTML = ''; // Limpa a tabela antes de preencher

        if (fornecedores.length === 0) {
            // Caso não encontre fornecedores, exibe uma mensagem
            tabela.innerHTML = '<tr><td colspan="6">Nenhum fornecedor encontrado.</td></tr>';
        } else {
            fornecedores.forEach(fornecedor => {
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td>${fornecedor.id}</td>
                    <td>${fornecedor.nome}</td>
                    <td>${fornecedor.cnpj}</td>
                    <td>${fornecedor.email}</td>
                    <td>${fornecedor.telefone}</td>
                    <td>${fornecedor.endereco}</td>
                `;
                tabela.appendChild(linha);
            });
        }
    } catch (error) {
        console.error('Erro ao listar fornecedores:', error);
    }
}

// Função para atualizar as informações do fornecedor
async function atualizarFornecedor() {
    const nome = document.getElementById('nome').value;
    const cnpj = document.getElementById('cnpj').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const endereco = document.getElementById('endereco').value;

    const fornecedorAtualizado = {
        nome,
        email,
        telefone,
        endereco,
        cnpj
    };

    try {
        const response = await fetch(`/fornecedores/cnpj/${cnpj}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fornecedorAtualizado)
        });

        if (response.ok) {
            alert('fornecedor atualizado com sucesso!');
        } else {
            const errorMessage = await response.text();
            alert('Erro ao atualizar fornecedor: ' + errorMessage);
        }
    } catch (error) {
        console.error('Erro ao atualizar fornecedor:', error);
        alert('Erro ao atualizar fornecedor.');
    }
}


async function limpaFornecedor() {
    document.getElementById('nome').value = '';
    document.getElementById('cnpj').value = '';
    document.getElementById('email').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('endereco').value = '';

}