const multer = require('../filtros/multer');
const knex = require('../conexao');
const { uploadArquivo, deletarArquivo } = require('../storage');

const listarProdutos = async (req, res) => {
    const { usuario } = req;
    const { categoria } = req.query;

    try {
        const produtos = await knex('produtos')
            .where({ usuario_id: usuario.id })
            .where(query => {
                if (categoria) {
                    return query.where('categoria', 'ilike', `%${categoria}%`);
                }
            });

        return res.status(200).json(produtos);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const produto = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produto) {
            return res.status(404).json('Produto não encontrado');
        }

        return res.status(200).json(produto);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarProduto = async (req, res) => {
    const { usuario } = req;
    const { nome, estoque, preco, categoria, descricao } = req.body;
    const { originalname, mimetype, buffer } = req.file

    if (!nome) {
        return res.status(404).json('O campo nome é obrigatório');
    }

    if (!estoque) {
        return res.status(404).json('O campo estoque é obrigatório');
    }

    if (!preco) {
        return res.status(404).json('O campo preco é obrigatório');
    }

    if (!descricao) {
        return res.status(404).json('O campo descricao é obrigatório');
    }

    try {
        let produto = await knex('produtos').insert({
            usuario_id: usuario.id,
            nome,
            estoque,
            preco,
            categoria,
            descricao,

        }).returning('*');

        if (!produto) {
            return res.status(400).json('O produto não foi cadastrado');
        }

        const imagem = await uploadArquivo(
            `produtos/${produto[0].id}/${originalname}`,
            buffer,
            mimetype
        )

        produto = await knex('produtos').update({
            imagem: imagem.path
        }).where({ id: produto[0].id }).returning('*')

        produto[0].imagem = imagem.url
        //isto fará com que seja exibido em nossa tela a url do arquivo enquanto que no banco de
        //dados estaremos guardando o path do arquivo que será muito útil para realizar a atualização
        //e exclusão da nossa imagem tanto no banco de dados quanto do servidor de upload!        

        return res.status(200).json(produto);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;
    const { nome, estoque, preco, categoria, descricao } = req.body;

    if (!nome && !estoque && !preco && !categoria && !descricao) {
        return res.status(404).json('Informe ao menos um campo para atualizaçao do produto');
    }

    try {
        const produtoEncontrado = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produtoEncontrado) {
            return res.status(404).json('Produto não encontrado');
        }

        const produto = await knex('produtos')
            .where({ id })
            .update({
                nome,
                estoque,
                preco,
                categoria,
                descricao
            });

        if (!produto) {
            return res.status(400).json("O produto não foi atualizado");
        }

        return res.status(200).json('produto foi atualizado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarImagem = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;
    const { originalname, mimetype, buffer } = req.file

    try {
        const produtoEncontrado = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produtoEncontrado) {
            return res.status(404).json('Produto não encontrado');
        }

        const imagemDeletada = await deletarArquivo(produtoEncontrado.imagem)

        const imagem = await uploadArquivo(
            `produtos/${id}/${originalname}`,
            buffer,
            mimetype
        )

        const produto = await knex('produtos').update({
            imagem: imagem.path
        }).where({ id }).returning('*')

        produto[0].imagem = imagem.url


        return res.status(200).json(produto[0])
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirProduto = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const produtoEncontrado = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();

        if (!produtoEncontrado) {
            return res.status(404).json('Produto não encontrado');
        }

        const produtoExcluido = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).del();

        if (!produtoExcluido) {
            return res.status(400).json("O produto não foi excluido");
        }

        return res.status(200).json('Produto excluido com sucesso');
    } catch (error) {
        return res.status(400).json(error.message);
    }

}

const excluirImagem = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params

    try {

        const produtoEncontrado = await knex('produtos').where({
            id,
            usuario_id: usuario.id
        }).first();
        console.log(produtoEncontrado)


        if (!produtoEncontrado) {
            return res.status(404).json('Produto não encontrado ');
        }
        if (!produtoEncontrado.imagem) {
            return res.status(404).json('imagem não existe')
        }

        const imagemExcluida = await deletarArquivo(produtoEncontrado.imagem)

        await knex('produtos').update({
            imagem: null
        }).where({ id: produtoEncontrado.id })


        return res.status(200).json('Imagem excluida com sucesso');

    } catch (error) {
        return res.status(400).json(error.message);
    }
}


module.exports = {
    listarProdutos,
    obterProduto,
    cadastrarProduto,
    atualizarProduto,
    atualizarImagem,
    excluirProduto,
    excluirImagem
}