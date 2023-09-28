const express = require('express');
const usuarios = require('./controladores/usuarios');
const login = require('./controladores/login');
const produtos = require('./controladores/produtos');
const verificaLogin = require('./filtros/verificaLogin');
const multer = require('./filtros/multer')

const rotas = express();

// cadastro de usuario
rotas.post('/usuarios', usuarios.cadastrarUsuario);

// login
rotas.post('/login', login.login);

// filtro para verificar usuario logado
rotas.use(verificaLogin);

// obter e atualizar perfil do usuario logado
rotas.get('/perfil', usuarios.obterPerfil);
rotas.put('/perfil', usuarios.atualizarPerfil);

// crud de produtos
rotas.get('/produtos', produtos.listarProdutos);
//rotas.get('/produtos/:id', produtos.obterProduto);
rotas.post('/produtos', multer.single('imagem'), produtos.cadastrarProduto);
//estamo passndo o multer como intermediario na rota para que possamos ler os dados do ARQUIVO de
//nome IMAGEM (inforado no insomnia no nosso multpart form data) no nosso controlador, se não 
//fizessemos isso não pegariamos as propriedades: originalname,mimetype, buffer, etc.
rotas.put('/produtos/:id', produtos.atualizarProduto);
//rotas.put('/produtos/:id/imagem', multer.single('imagem'), produtos.atualizarImagem);
rotas.delete('/produtos/:id', produtos.excluirProduto);
rotas.delete('/produtos/:id/imagem', produtos.excluirImagem);
module.exports = rotas;