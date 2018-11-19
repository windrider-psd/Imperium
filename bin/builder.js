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
        models.Planeta.afterCreate((intancia) => {
            models.RecursosPlanetarios.create({planetaID : intancia.id})
            models.Edificios.create({planetaID : intancia.id})
            models.Frota.create({planetaID : intancia.id})
        })
        console.log("Sincronização completa");
        console.log("Gerando Setores");
        models.Setor.afterCreate((instancia) =>
        {
            builder.PopularSetor(instancia)
        })
        builder.GerarSetores();
    })
}, 3000)