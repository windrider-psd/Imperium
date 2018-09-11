const builder = require('./../services/DBModelsBuilder')
const models = require("./../model/DBModels")
const yargs = require('yargs').argv

var forca = yargs.force ? yargs.force : true

console.log("Construindo a base de dados");

builder.ClearForeignKeys();


setTimeout(() =>
{
    builder.SyncDatabase(forca,  () =>
    {
        console.log("Sincronização completa");
        console.log("Gerando Setores");
        models.Setor.afterCreate((instancia) =>
        {
            builder.PopularSetor(instancia)
        })
        builder.GerarSetores();
    })
}, 3000)