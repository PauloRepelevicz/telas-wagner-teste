async function registraServico(event) {
    event.preventDefault();
    const produto = {
        nome: document.getElementById("servico").value
    };
    alert(produto);

    await fetch('/cadastrar-servico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto)
    }).then(response => response.text())
    .then(data => {
        alert(data);
        document.getElementById('servico').reset();
    })
    .catch(error => {
        console.error('Erro ao cadastrar serviço:', error);
    });

}
