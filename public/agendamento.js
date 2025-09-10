async function buscaServico() {
    
    fetch('/buscar-servicos')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar serviços');
            }
            return response.json();
        })
        .then(servicos => {
            const select = document.getElementById('servicoSelecionado');
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

async function buscaHorariosDisponiveis() {
    
    const data = document.getElementById('data').value;
    const id = document.getElementById('servicoSelecionado').value;
    // Verifica se ambos os campos estão preenchidos
    if (!data || !id) { 
        return; // Aguarde até que ambos os campos estejam preenchidos
    }
    
    fetch(`/horarios-disponiveis?data=${data}&id=${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar horários disponíveis');
            }
            
            return response.json();
        })
        .then(horariosDisponiveis => {
            const selectHorario = document.getElementById('horaSelecionada');
            selectHorario.innerHTML = '<option value="">Selecione o Horário</option>';

            if (horariosDisponiveis.length > 0) {
                horariosDisponiveis.forEach(horario => {
                    const option = document.createElement('option');
                    option.value = horario;
                    option.textContent = horario;
                    selectHorario.appendChild(option);
                });
            } else {
                alert('Não há horários disponíveis para esta data e serviço.');
            }
        })
        .catch(error => {
            console.error('Erro ao carregar horários disponíveis:', error);
        });
}



async function cadastrarAgendamento(event) {
    event.preventDefault();
  
    const data = document.getElementById('data').value; 
    const horario = document.getElementById('horaSelecionada').value;
    const cpf_cliente = document.getElementById('cpf').value;
    const cnpj_fornecedor = document.getElementById('cnpj').value;
    const id_servico = document.getElementById('servicoSelecionado').value;
  
    if (!data || !horario || !cpf_cliente || !cnpj_fornecedor || !id_servico) {
      alert('Preencha todos os campos.');
      return;
    }
  
    try {
      const resp = await fetch('/cadastrar-agendamento', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ data, horario, cpf_cliente, cnpj_fornecedor, id_servico })
      });
  
      const texto = await resp.text();
  
      if (!resp.ok) {
        console.error('Falha no cadastro:', texto);
        alert(`Erro ao cadastrar: ${texto}`);
        return;
      }
  
      alert('Agendamento cadastrado com sucesso!');
      document.getElementById('filters').reset();
      document.getElementById('horaSelecionada').innerHTML =
        '<option value="">Selecione o Horário</option>';
  
    } catch (e) {
      console.error('Erro ao cadastrar agendamento:', e);
      alert('Erro de rede ao cadastrar.');
    }
}
  