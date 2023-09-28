const aws = require('aws-sdk')

const endpoint = new aws.Endpoint(process.env.ENDPOINTS3_BUCKET)

const s3 = new aws.S3({
    endpoint,
    credentials: {
        accessKeyId: process.env.KEYID_BUCKET,
        secretAccessKey: process.env.APPKEY_BUCKET
    }
})

const uploadArquivo = async (path, buffer, mimetype) => {
    const imagem = await s3.upload({
        Bucket: process.env.BACKBLAZE_BUCKET,
        Key: path,
        Body: buffer,
        ContentType: mimetype
    }).promise()

    return ({
        url: imagem.Location,
        path: imagem.Key
    })
}

const deletarArquivo = async (path) => {

    await s3.deleteObject({
        Bucket: process.env.BACKBLAZE_BUCKET,
        Key: path
    }).promise()

}





module.exports = { uploadArquivo, deletarArquivo }