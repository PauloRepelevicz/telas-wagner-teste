async function cadastrarFunc(event) {
    event.preventDefault();

    const funcionario = {
        nome: document.getElementById('nomefunc').value,
        cpf: document.getElementById('cpfunc').value,
        telefone: document.getElementById('telefonefunc').value,
        cargo: document.getElementById('cargofunc').value,
        email: document.getElementById('emailfunc').value,
        data_nascimento: document.getElementById('dataNascfunc').value,
        genero: document.getElementById('generofunc').value,
        logradouro: document.getElementById('enderecofunc').value,
        numero: document.getElementById('numerofunc').value,
        bairro: document.getElementById('bairrofunc').value,
        cidade: document.getElementById('cidadefunc').value,
        estado: document.getElementById('estadofunc').value,
        cep: document.getElementById('cepfunc').value,
        complemento: document.getElementById('complementofunc').value,
        observacoes: document.getElementById('observacoesfunc').value
    };

    try {
        const response = await fetch('/funcionario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(funcionario)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Funcionário cadastrado com sucesso!");
            document.getElementById("funcForm").reset();
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (err) {
        console.error("Erro na solicitação:", err);
        alert("Erro ao cadastrar Funcionário.");
    }
}

 
 // Função para listar todos os funcionários ou buscar funcionários por CPF
 async function listarFuncionarios() {

     const cpf = document.getElementById('cpfunc').value.trim();  // Pega o valor do CPF digitado no input

     let url = '/funcionario';  // URL padrão para todos os funcionarios

     if (cpf) {
         // Se CPF foi digitado, adiciona o parâmetro de consulta
         url += `?cpf=${cpf}`;
     }
     
     try {
         const response = await fetch(url);
         const funcionarios = await response.json();

         const tabela = document.getElementById('tabela-funcionarios');
         tabela.innerHTML = ''; // Limpa a tabela antes de preencher

         if (funcionarios.length === 0) {
             // Caso não encontre funcionários, exibe uma mensagem
             tabela.innerHTML = '<tr><td colspan="6">Nenhum funcionário encontrado.</td></tr>';
         } else {
             funcionarios.forEach(funcionario => {
                 const linha = document.createElement('tr');
                 linha.innerHTML = `
                     <td>${funcionario.func_id}</td>
                     <td>${funcionario.func_nome}</td>
                     <td>${funcionario.func_cpf}</td>
                     <td>${funcionario.func_email}</td>
                     <td>${funcionario.func_telefone}</td>
                     <td>${funcionario.func_logradouro}</td>
                     <td>${funcionario.func_cargo}</td>
                     
                 `;
                 tabela.appendChild(linha);
             });
         }
     } catch (error) {
         console.error('Erro ao listar funcionários:', error);
     }
 }

async function atualizarFuncionario() {

    const cpf = document.getElementById("cpfunc").value;

    const funcionarioAtualizado = { 
        nome: document.getElementById("nomefunc").value,
        telefone: document.getElementById("telefonefunc").value,
        email: document.getElementById("emailfunc").value,
        data_nascimento: document.getElementById("dataNascfunc").value,
        cargo: document.getElementById("cargofunc").value,
        logradouro: document.getElementById("enderecofunc").value,
        numero: document.getElementById("numerofunc").value,
        bairro: document.getElementById("bairrofunc").value,
        cidade: document.getElementById("cidadefunc").value,
        estado: document.getElementById("estadofunc").value,
        cep: document.getElementById("cepfunc").value,
        complemento: document.getElementById("complementofunc").value,
        observacoes: document.getElementById("observacoesfunc").value
    };

    try {
        const response = await fetch(`/funcionario/cpf/${cpf}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(funcionarioAtualizado),
        });

        if (response.ok) {
            alert("Funcionário atualizado com sucesso!");
        } else {
            const errorMessage = await response.text();
            alert("Erro ao atualizar Funcionário: " + errorMessage);
        }
    } catch (error) {
        console.error("Erro ao atualizar Funcionário:", error);
        alert("Erro ao atualizar Funcionário.");
    }
}


async function limpaFunc() {
    document.getElementById('nome').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('email').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('cargo').value = '';
    document.getElementById('endereco').value = '';
}


// ----------------- FORMATAÇÕES -----------------

// CPF
function formatarCPF(cpfunc) {
    return cpfunc
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
document.getElementById("cpfunc").addEventListener("input", (e) => {
    e.target.value = formatarCPF(e.target.value);
});

// CEP
function formatarCEP(cepfunc) {
    return cepfunc
        .replace(/\D/g, "")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 9);
}
document.getElementById("cepfunc").addEventListener("input", async (e) => {
    e.target.value = formatarCEP(e.target.value);

    const cepfunc = e.target.value.replace(/\D/g, "");
    if (cepfunc.length === 8) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepfunc}/json/`);
            const data = await response.json();
            if (!data.erro) {
                document.getElementById("enderecofunc").value = data.logradouro || "";
                document.getElementById("bairrofunc").value = data.bairro || "";
                document.getElementById("cidadefunc").value = data.localidade || "";
                document.getElementById("estadofunc").value = data.uf || "";
            }
        } catch (err) {
            console.error("Erro ao buscar CEP:", err);
        }
    }
});

// TELEFONE
function formatarTelefone(telefonefunc) {
    telefonefunc = telefonefunc.replace(/\D/g, "");
    if (telefonefunc.length <= 10) {
        return telefonefunc.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else {
        return telefonefunc.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    }
}
document.getElementById("telefonefunc").addEventListener("input", (e) => {
    e.target.value = formatarTelefone(e.target.value);
});

// VALIDAR DATA DE NASCIMENTO
document.getElementById("dataNascfunc").addEventListener("change", (e) => {
    const dataNascfunc = new Date(e.target.value);
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNascfunc.getFullYear();
    const mes = hoje.getMonth() - dataNascfunc.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascfunc.getDate())) {
        idade--;
    }

    if (idade < 18) {
        alert("O funcionario deve ter pelo menos 18 anos.");
        e.target.value = "";
    }
});