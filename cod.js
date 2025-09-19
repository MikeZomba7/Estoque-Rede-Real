// Verifica se há um usuário logado antes de carregar a página
if (!localStorage.getItem('usuarioLogado')) {
    window.location.href = 'cadastro.html';
}

// Pega o email do usuário logado para carregar e salvar os dados
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
const emailUsuario = usuarioLogado.email;

// Carrega todos os dados do localStorage e, em seguida, os dados específicos do usuário
let todosOsDados = JSON.parse(localStorage.getItem('dadosPorUsuario')) || {};
let dadosDoUsuario = todosOsDados[emailUsuario] || {
    produtos: [],
    movimentos: {},
    produtoSelecionado: null
};

// Atribui os dados do usuário às variáveis de trabalho
let produtos = dadosDoUsuario.produtos;
let produtoSelecionado = null; // Precisa ser re-selecionado a cada sessão
let movimentos = dadosDoUsuario.movimentos;

// Função para salvar os dados específicos do usuário no localStorage
function salvarDados() {
    todosOsDados[emailUsuario] = {
        produtos: produtos,
        movimentos: movimentos
    };
    localStorage.setItem('dadosPorUsuario', JSON.stringify(todosOsDados));
}

// Função de importação do arquivo XLS
function importarArquivo() {
    const arquivo = document.getElementById('arquivoXLS').files[0];
    if (!arquivo) {
        alert('Por favor, selecione um arquivo.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const planilha = workbook.Sheets[workbook.SheetNames[0]];
        const produtosImportados = XLSX.utils.sheet_to_json(planilha, { header: 1 });

        produtos = produtosImportados.slice(1).map(produto => ({
            id: produto[0] || 'Não informado',
            nome: produto[1] || 'Não informado',
            categoria: produto[2] || 'Não informado',
            estoque: produto[3] || 0,
            status: produto[4] || 'Em estoque',
            observacoes: produto[5] || 'Sem observações',
        }));

        salvarDados();
        exibirEstoque();
        alert('Arquivo importado com sucesso!');
    };
    reader.readAsArrayBuffer(arquivo);
}

// Exibe os produtos na tabela ou uma mensagem de "sem produtos"
function exibirEstoque() {
    const tabelaEstoque = document.getElementById('tabelaEstoque').getElementsByTagName('tbody')[0];
    tabelaEstoque.innerHTML = '';
    
    if (produtos.length === 0) {
        const row = tabelaEstoque.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 7;
        cell.textContent = "Nenhum produto encontrado. Por favor, importe uma planilha.";
        cell.style.textAlign = "center";
        cell.style.padding = "20px";
    } else {
        produtos.forEach(produto => {
            const row = tabelaEstoque.insertRow();
            row.setAttribute('data-id', produto.id);

            row.insertCell(0).textContent = produto.id;
            row.insertCell(1).textContent = produto.nome;
            row.insertCell(2).textContent = produto.categoria;
            row.insertCell(3).textContent = produto.estoque;
            row.insertCell(4).textContent = produto.status;
            row.insertCell(5).textContent = produto.observacoes;

            const cellAção = row.insertCell(6);
            cellAção.classList.add('action-buttons');

            const botaoEditar = document.createElement('button');
            botaoEditar.textContent = 'Editar';
            botaoEditar.classList.add('edit-btn');
            botaoEditar.onclick = () => editarProduto(produto.id);
            cellAção.appendChild(botaoEditar);

            const botaoExcluir = document.createElement('button');
            botaoExcluir.textContent = 'Excluir';
            botaoExcluir.classList.add('delete-btn');
            botaoExcluir.onclick = () => excluirProduto(produto.id);
            cellAção.appendChild(botaoExcluir);
        });
    }
}

// Remove um produto da lista
function excluirProduto(produtoId) {
    produtos = produtos.filter(produto => produto.id !== produtoId);
    salvarDados();
    exibirEstoque();
}

function editarProduto(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    if (produto) {
        produtoSelecionado = produto;

        // Atualiza a aba de informações do produto
        const infoDiv = document.getElementById('produtoEditadoInfo');
        infoDiv.innerHTML = `
            <strong>Produto:</strong> ${produto.nome} <br>
            <strong>Categoria:</strong> ${produto.categoria} <br>
            <strong>Observações:</strong> ${produto.observacoes}
        `;

        mostrarSecao('controleEntradaSaida');
        document.getElementById('historicoMensal').style.display = 'block';

        const secao = document.getElementById('controleEntradaSaida');
        if (secao) {
            secao.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
    }
}




function buscarProduto() {
    const filtro = document.getElementById('buscarProduto').value.toLowerCase();
    const tabelaEstoque = document.getElementById('tabelaEstoque').getElementsByTagName('tbody')[0];
    const rows = tabelaEstoque.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const nomeProduto = row.cells[1].textContent.toLowerCase();
        row.style.display = nomeProduto.includes(filtro) ? '' : 'none';
    });

    if (!filtro) {
        document.getElementById('controleEntradaSaida').style.display = 'none';
        document.getElementById('historicoMensal').style.display = 'none';
    }
}
function registrarMovimento() {
    const quantidadeEntrada = parseInt(document.getElementById('quantidadeEntrada').value) || 0;
    const quantidadeSaida = parseInt(document.getElementById('quantidadeSaida').value) || 0;

// 1️⃣ Mensagem de sucesso na página
const mensagem = document.getElementById('mensagemRegistro');
mensagem.textContent = 'Registro feito com sucesso!';
mensagem.style.display = 'block';

// 2️⃣ A mensagem desaparece após 2 segundos
setTimeout(() => {
    mensagem.style.display = 'none';
}, 4000);


    if (quantidadeEntrada > 0) {
        produtoSelecionado.estoque += quantidadeEntrada;
        registrarMovimentoMensal(produtoSelecionado.id, 'entrada', quantidadeEntrada);
    }

    if (quantidadeSaida > 0) {
        produtoSelecionado.estoque -= quantidadeSaida;
        registrarMovimentoMensal(produtoSelecionado.id, 'saida', quantidadeSaida);
    }

    salvarDados();
    exibirEstoque();

    // 1️⃣ Mensagem de sucesso
    alert('Registro feito com sucesso!');

    // 2️⃣ Zerar os campos
    document.getElementById('quantidadeEntrada').value = '';
    document.getElementById('quantidadeSaida').value = '';
}


function registrarMovimentoMensal(idProduto, tipo, quantidade) {
    const hoje = new Date();
    const mesAno = `${hoje.getMonth() + 1}/${hoje.getFullYear()}`;

    // Inicializa estrutura caso não exista
    if (!movimentos[idProduto]) {
        movimentos[idProduto] = { totalMensal: {}, registros: [] };
    }

    // Mantém resumo mensal
    if (!movimentos[idProduto].totalMensal[mesAno]) {
        movimentos[idProduto].totalMensal[mesAno] = { entradas: 0, saidas: 0 };
    }

    if (tipo === 'entrada') {
        movimentos[idProduto].totalMensal[mesAno].entradas += quantidade;
    } else if (tipo === 'saida') {
        movimentos[idProduto].totalMensal[mesAno].saidas += quantidade;
    }

    // Registra cada alteração com data completa
    movimentos[idProduto].registros.push({
        tipo: tipo,
        quantidade: quantidade,
        data: hoje.toISOString() // salva data completa
    });

    // Salva e atualiza histórico
    salvarDados();
    mostrarHistoricoMensal(idProduto);
}
function mostrarHistoricoMensal(idProduto) {
    const historicoTabela = document.getElementById('historicoTabela');
    historicoTabela.innerHTML = '';

    const historico = movimentos[idProduto]?.totalMensal || {};  // ✅ pega totalMensal corretamente

    for (const mesAno in historico) {
        const row = historicoTabela.insertRow();
        row.insertCell(0).textContent = mesAno;
        row.insertCell(1).textContent = historico[mesAno].entradas;
        row.insertCell(2).textContent = historico[mesAno].saidas;
    }

    // Exibir informações do produto acima da tabela
    const produto = produtos.find(p => p.id === idProduto);
    const infoDiv = document.getElementById('infoProdutoSelecionado');

    if (produto && infoDiv) {
        infoDiv.innerHTML = `
            📦 <strong>Produto:</strong> ${produto.nome}<br>
            📂 <strong>Categoria:</strong> ${produto.categoria}<br>
            📝 <strong>Observações:</strong> ${produto.observacoes}
        `;
    }

    document.getElementById('historicoMensal').style.display = 'block';
}
// Inicia a exibição do estoque ao carregar a página
document.addEventListener('DOMContentLoaded', exibirEstoque);

function exportarArquivo() {
    if (produtos.length === 0) {
        alert('Nenhum produto disponível para exportar.');
        return;
    }

    // Monta os dados no formato de matriz
    const dados = [
        ["ID", "Nome", "Categoria", "Estoque", "Status", "Observações"],
        ...produtos.map(p => [p.id, p.nome, p.categoria, p.estoque, p.status, p.observacoes])
    ];

    // Cria a planilha
    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estoque");

    // Gera o arquivo para download
    XLSX.writeFile(wb, "estoque_atualizado.xlsx");
}
function alterarTema(tema) {
    document.body.classList.remove("tema-claro", "tema-escuro");

    if (tema === "claro") {
        document.body.classList.add("tema-claro");
    } else if (tema === "escuro") {
        document.body.classList.add("tema-escuro");
    }
    
    // Salva no localStorage
    localStorage.setItem("temaSelecionado", tema);
}

// Aplica o tema salvo ao carregar
document.addEventListener("DOMContentLoaded", () => {
    const temaSalvo = localStorage.getItem("temaSelecionado") || "neutro";
    document.getElementById("themeSelector").value = temaSalvo;
    alterarTema(temaSalvo);
});

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
  }
  function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
  }
  function mostrarSecao(id) {
    const secoes = ["exportar","controleEntradaSaida","historicoMensal","admin"];
    secoes.forEach(sec => document.getElementById(sec).style.display = "none");
    document.getElementById(id).style.display = "block";
    closeNav();
  }

  // Lista de usuários em memória
  const usuarios = [];

  function criarUsuario() {
    const nome = document.getElementById("novoUsuario").value;
    const permissao = document.getElementById("permissoes").value;

    if (!nome) {
      alert("Digite um nome para o usuário!");
      return;
    }

    usuarios.push({ nome, permissao });
    atualizarListaUsuarios();
    document.getElementById("novoUsuario").value = "";
  }

  function atualizarListaUsuarios() {
    const lista = document.getElementById("listaUsuarios");
    lista.innerHTML = "";
    usuarios.forEach((u, i) => {
      const li = document.createElement("li");
      li.textContent = `${u.nome} - Permissão: ${u.permissao}`;
      lista.appendChild(li);
    });
  }
  
// Função para exibir o link de administrador se o usuário for admin
function mostrarLinkAdmin() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (usuarioLogado && usuarioLogado.isAdmin) {
        document.getElementById('admin-link').style.display = 'block';
    }
}

// Adiciona a chamada à função no evento de carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    exibirEstoque();
    mostrarLinkAdmin();
});
document.addEventListener('DOMContentLoaded', () => {
  const campoBusca = document.getElementById('buscarProduto');
  if (campoBusca) {
    campoBusca.addEventListener('input', filtrarTabelaProdutos);
  }
});

function filtrarTabelaProdutos() {
  const filtro = document.getElementById('buscarProduto').value.toLowerCase();
  const tabela = document.getElementById('tabelaEstoque').getElementsByTagName('tbody')[0];
  const linhas = tabela.getElementsByTagName('tr');

  Array.from(linhas).forEach(linha => {
    const colunas = linha.getElementsByTagName('td');
    const conteudoLinha = Array.from(colunas).map(col => col.textContent.toLowerCase()).join(' ');

    linha.style.display = conteudoLinha.includes(filtro) ? '' : 'none';
  });
}
document.addEventListener('DOMContentLoaded', () => {
    // Se já houver produtos importados, oculta a seção de importação
    if (produtos && produtos.length > 0) {
        const secaoImportacao = document.getElementById('secaoImportacao');
        if (secaoImportacao) {
            secaoImportacao.style.display = 'none';
        }
    }
});
function fecharControle() {
    const controle = document.getElementById('controleEntradaSaida');
    if (controle) {
        controle.style.display = 'none';
    }
}
 function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
  }
  function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
  }
  function mostrarSecao(id) {
    if (id === 'admin') {
      const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
      if (usuarioLogado && usuarioLogado.isAdmin) {
        window.location.href = 'admin.html';
      } else {
        alert('Acesso negado. Você não tem permissão de administrador.');
        closeNav();
      }
    } else {
      const secoes = ["exportar", "controleEntradaSaida", "historicoMensal"];
      secoes.forEach(sec => {
        const element = document.getElementById(sec);
        if (element) {
          element.style.display = "none";
        }
      });
      const selectedElement = document.getElementById(id);
      if (selectedElement) {
        selectedElement.style.display = "block";
      }
      closeNav();
    }
  }
  


