// Verifica se o usuário é admin
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
if (!usuarioLogado || !usuarioLogado.isAdmin) {
    alert('Acesso negado. Você não tem permissão de administrador.');
    window.location.href = 'index.html';
}

// Cria lista de usuários no localStorage se não existir
if (!localStorage.getItem('usuarios')) {
    localStorage.setItem('usuarios', JSON.stringify([]));
}

// Mapeia os nomes das permissões
const permissoesLabel = {
    lancar: "Lançar Produto",
    retirar: "Retirar Produto",
    visualizar: "Somente Visualizar"
};

function carregarUsuarios() {
    const lista = document.getElementById('listaUsuarios');
    lista.innerHTML = '';
    const usuarios = JSON.parse(localStorage.getItem('usuarios'));
    usuarios.forEach((u, index) => {
        const li = document.createElement('li');
        li.textContent = `${u.nome} - (${permissoesLabel[u.permissao]})`;
        const btn = document.createElement('button');
        btn.textContent = "Remover";
        btn.classList.add("remove-btn");
        btn.onclick = () => removerUsuario(index);
        li.appendChild(btn);
        lista.appendChild(li);
    });
}

function criarUsuario() {
    const nome = document.getElementById('novoUsuario').value.trim();
    const permissao = document.getElementById('permissoes').value;

    if (nome === "") {
        alert("Digite um nome válido!");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem('usuarios'));
    if (usuarios.some(u => u.nome === nome)) {
        alert("Esse usuário já existe!");
        return;
    }

    usuarios.push({ nome, permissao });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    document.getElementById('novoUsuario').value = "";
    carregarUsuarios();
}

function removerUsuario(index) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios'));
    usuarios.splice(index, 1);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    carregarUsuarios();
}

window.onload = carregarUsuarios;