// Verifica se usuário está logado
if (!localStorage.getItem('usuarioLogado')) {
    window.location.href = 'cadastro.html';
}
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
const emailUsuario = usuarioLogado.email;

// Carrega dados
let todosOsDados = JSON.parse(localStorage.getItem('dadosPorUsuario')) || {};
let dadosDoUsuario = todosOsDados[emailUsuario] || { produtos: [], movimentos: {} };
let produtos = dadosDoUsuario.produtos;
let movimentos = dadosDoUsuario.movimentos;

// Converte movimentos antigos (se houver) para registros completos
for (let id in movimentos) {
    const m = movimentos[id];
    if (!m.registros) {
        // Se for o formato antigo sem registros, converte
        let registros = [];
        for (const mesAno in m) {
            const entradas = m[mesAno].entradas || 0;
            const saidas = m[mesAno].saidas || 0;
            const partes = mesAno.split('/');
            const mes = parseInt(partes[0]) - 1;
            const ano = parseInt(partes[1]);
            const dataReferencia = new Date(ano, mes, 1);
            if (entradas > 0) registros.push({ tipo: 'entrada', quantidade: entradas, data: dataReferencia.toISOString() });
            if (saidas > 0) registros.push({ tipo: 'saida', quantidade: saidas, data: dataReferencia.toISOString() });
        }
        movimentos[id].registros = registros;
        movimentos[id].totalMensal = m; // mantém resumo antigo
    }
}

// Função para montar tabela do relatório
function montarRelatorio(filtrarInicio = null, filtrarFim = null) {
    const tbody = document.getElementById('tabelaRelatorio').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';

    produtos.forEach(produto => {
        const registrosProduto = (movimentos[produto.id] && movimentos[produto.id].registros) || [];
        // Filtra apenas registros dentro do intervalo
        const registrosFiltrados = registrosProduto.filter(mov => {
            const dataMov = new Date(mov.data);
            if (!filtrarInicio || !filtrarFim) return true;
            return dataMov >= filtrarInicio && dataMov <= filtrarFim;
        });

        if (registrosFiltrados.length > 0) {
            let entradas = 0;
            let saidas = 0;
            let ultimaData = null;

            registrosFiltrados.forEach(mov => {
                if (mov.tipo === 'entrada') entradas += mov.quantidade;
                else if (mov.tipo === 'saida') saidas += mov.quantidade;

                const dataMov = new Date(mov.data);
                if (!ultimaData || dataMov > ultimaData) ultimaData = dataMov;
            });

            const row = tbody.insertRow();
            row.insertCell(0).textContent = produto.nome;
            row.insertCell(1).textContent = produto.categoria;
            row.insertCell(2).textContent = produto.estoque;
            row.insertCell(3).textContent = produto.status;
            row.insertCell(4).textContent = entradas;
            row.insertCell(5).textContent = saidas;
            row.insertCell(6).textContent = ultimaData.toLocaleDateString('pt-BR');
        }
    });
}

// Função para filtrar relatório
function filtrarRelatorio() {
    const inicioInput = document.getElementById('dataInicio').value;
    const fimInput = document.getElementById('dataFim').value;

    if (!inicioInput || !fimInput) {
        alert('Selecione data de início e fim.');
        return;
    }

    const dataInicio = new Date(inicioInput);
    const dataFim = new Date(fimInput);

    const diffDias = (dataFim - dataInicio) / (1000 * 60 * 60 * 24);
    if (diffDias > 30) {
        alert('O intervalo máximo permitido é de 31 dias.');
        return;
    }

    montarRelatorio(dataInicio, dataFim);
}

// Ao carregar página, exibe últimos 30 dias por padrão
document.addEventListener('DOMContentLoaded', () => {
    const hoje = new Date();
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - 30);

    document.getElementById('dataInicio').value = inicio.toISOString().split('T')[0];
    document.getElementById('dataFim').value = hoje.toISOString().split('T')[0];

    montarRelatorio(inicio, hoje);
});
// Aplica tema baseado no localStorage
document.addEventListener('DOMContentLoaded', () => {
    const temaSalvo = localStorage.getItem('temaSelecionado') || 'neutro';
    document.body.classList.add(`tema-${temaSalvo}`);

// Aplica apenas o tema baseado no localStorage, sem criar seletor
document.body.classList.add(`tema-${temaSalvo}`);

});
