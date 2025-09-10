 // Função para buscar cliente pelo CPF
function buscarCliente() {
  const cpf = document.getElementById("cpfcliente").value;

  if (!cpf) {
    alert("Por favor, insira o CPF do cliente.");
    return;
  }

  fetch(`/clientes/${cpf}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Cliente não encontrado.");
      }
      return response.json();
    })
    .then((clientes) => {
      const clienteInfo = document.getElementById("cliente-info");
      clienteInfo.innerHTML = `
        <h1>Nome: ${clientes.cli_nome}</h1>
      `;
    })
    .catch((error) => {
    alert(error.message);
    });
}    

// Função para buscar produto e adicioná-lo ao carrinho
function adicionarProdutoAoCarrinho() {
  const id = document.getElementById("produto-nome").value;
  const quantidade = parseInt(document.getElementById("produto-quantidade").value);

  if (!id || isNaN(quantidade) || quantidade <= 0) {
    alert("Por favor, insira um produto válido e uma quantidade maior que zero.");
    return;
  }

  fetch(`/produtos_carrinho/${id}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Produto não encontrado.");
      }
      return response.json();
    })
    .then((produto) => {
      adicionarProdutoNaTabela(produto, quantidade);
    })
    .catch((error) => {
      alert(error.message);
    });
}  

// Função para adicionar produto na tabela de carrinho
function adicionarProdutoNaTabela(produto, quantidade) {
  const carrinhoBody = document.querySelector("#carrinho");

  const subtotal = produto.preco * quantidade;
  const novaLinha = document.createElement("tr");

    novaLinha.setAttribute('data-id', produto.id);
  novaLinha.innerHTML = `
    <td>${produto.id}</td>  
    <td>${produto.nome}</td>
    <td>${quantidade}</td>
    <td>R$ ${produto.preco.toFixed(2)}</td>
    <td>R$ ${subtotal.toFixed(2)}</td>
    <td><button onclick="removerProduto(this, ${subtotal})">Remover</button></td>
  `;

  carrinhoBody.appendChild(novaLinha);

  atualizarTotalVenda(subtotal);
}

// Função para remover produto do carrinho
function removerProduto(botao, subtotal) {
  botao.closest("tr").remove();
  atualizarTotalVenda(-subtotal);
}

// Função para atualizar o total da venda
function atualizarTotalVenda(valor) {
  const totalVendaElement = document.getElementById("total-venda");
  const valorAtual = parseFloat(totalVendaElement.getAttribute("data-total")) || 0;
  const novoTotal = valorAtual + valor;

  totalVendaElement.setAttribute("data-total", novoTotal);
  totalVendaElement.textContent = `Total: R$ ${novoTotal.toFixed(2)}`;
}

// Função para finalizar a venda
function finalizarVenda() {
  const cpfCliente = document.getElementById("cpf-cliente").value;
  const carrinhoRows = document.querySelectorAll("#carrinho tr");
  const totalVenda = parseFloat(document.getElementById("total-venda").getAttribute("data-total"));

  if (!cpfCliente) {
      alert("Por favor, insira o CPF do cliente.");
      return;
  }

  if (carrinhoRows.length === 0) {
      alert("O carrinho está vazio. Adicione produtos para finalizar a venda.");
      return;
  }

  const itens = [];
  carrinhoRows.forEach((row) => {
      const idProduto = row.getAttribute("data-id");
      const quantidade = parseInt(row.children[2].textContent); // Quantidade está na 3ª coluna
      if (!idProduto || isNaN(quantidade) || quantidade <= 0) {
          console.error("Produto ou quantidade inválidos:", idProduto, quantidade);
          return;
      }
      itens.push({ idProduto, quantidade });
  });

  const venda = {
      cliente_cpf: cpfCliente,
      itens
  };

  fetch('/vendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(venda),
  })
      .then((response) => {
          if (!response.ok) {
              throw new Error("Erro ao finalizar a venda. Verifique os dados.");
          }
          return response.json();
      })
      .then(data) => {
          alert("Venda realizada com sucesso!");
          limparFormulario();
          //location.reload();
      })
      .catch((error) => {
          alert(error.message);
      });
}




function limparFormulario() {
  document.getElementById("cpf-cliente").value = "";
  document.getElementById("cliente-info").innerHTML = "";
  document.querySelector("#carrinho").innerHTML = "";
  const totalVendaElement = document.getElementById("total-venda");
  totalVendaElement.setAttribute("data-total", "0");
  totalVendaElement.textContent = "Total: R$ 0,00";
}



function buscarProdutos() {
    fetch('/buscar-produtos')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao buscar produtos');
        }
            return response.json();
        })
        .then(servicos => {
            const select = document.getElementById('produto-nome');
            servicos.forEach(servico => {
                const option = document.createElement('option');
                option.value = servico.id; // Usa o id como valor
                option.textContent = `${servico.nome} ------------- Disponível: ${servico.quantidade_estoque}`; // Nome do serviço exibido
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar os serviços:', error);
        });
 }


// Função para buscar o relatório com filtros
function buscarRelatorio() {
  const cpf = document.getElementById("cpf").value;
  const produto = document.getElementById("produto").value;
  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;

  // Construir a URL com os parâmetros de filtro
  let url = `/relatorios?`;
  if (cpf) url += `cpf=${cpf}&`;
  if (produto) url += `produto=${produto}&`;
  if (dataInicio) url += `dataInicio=${dataInicio}&`;
  if (dataFim) url += `dataFim=${dataFim}&`;

  // Remover o último "&" se presente
  url = url.slice(0, -1);

  // Fazer a requisição para o servidor
  fetch(url)
      .then(response => response.json())
      .then(data => {
          // Limpar a tabela
          const tabelaVendas = document.getElementById("tabela-vendas");
          tabelaVendas.innerHTML = '';

          // Preencher a tabela com os dados
          data.forEach(vendas => {
              const tr = document.createElement("tr");
              tr.innerHTML = `
                  <td>${produto.prod_id}</td>
                  <td>${produto.prod_nome}</td>
                  <td>${vendas.produto_nome}</td>
                  <td>${vendas.quantidade}</td>
                  <td>${new Date(vendas.data).toLocaleString()}</td>
              `;
              tabelaVendas.appendChild(tr);
          });
      })
      .catch(error => {
          console.error('Erro ao buscar relatórios:', error);
      });
}


// ----------------- FORMATAÇÕES ----------------- //

// CPF
function formatarCPF(cpfcliente) {
    return cpfcliente
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
document.getElementById("cpfcliente").addEventListener("input", (e) => {
    e.target.value = formatarCPF(e.target.value);
});