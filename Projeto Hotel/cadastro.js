document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('formCadastro');
    const formLogin = document.getElementById('formLogin');

    if (formCadastro) {
        formCadastro.addEventListener('submit', function(event) {
            event.preventDefault();

            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;

            let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

            const emailExistente = usuarios.find(u => u.email === email);
            if (emailExistente) {
                alert('Este e-mail já está cadastrado. Por favor, faça login.');
                return;
            }

            // Adiciona a propriedade 'isAdmin' ao novo usuário, por padrão como false
            usuarios.push({ nome: nome, email: email, senha: senha, isAdmin: false });

            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            localStorage.setItem('usuarioLogado', JSON.stringify({ email: email, isAdmin: false }));

            alert('Cadastro realizado com sucesso! Redirecionando...');
            window.location.href = 'index.html';
        });
    }

    if (formLogin) {
        formLogin.addEventListener('submit', function(event) {
            event.preventDefault();

            const email = document.getElementById('emailLogin').value;
            const senha = document.getElementById('senhaLogin').value;
            const isAdmin = document.getElementById('isAdmin').checked;

            let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

            const usuarioExistente = usuarios.find(u => u.email === email && u.senha === senha);

            if (usuarioExistente) {
                // Se a checkbox 'isAdmin' estiver marcada, define o usuário como administrador
                if (isAdmin) {
                    usuarioExistente.isAdmin = true;
                }
                localStorage.setItem('usuarioLogado', JSON.stringify({ email: email, isAdmin: usuarioExistente.isAdmin }));
                localStorage.setItem('usuarios', JSON.stringify(usuarios));

                alert('Login bem-sucedido! Redirecionando...');
                window.location.href = 'index.html';
            } else {
                alert('E-mail ou senha incorretos. Por favor, tente novamente.');
            }
        });
    }
});
