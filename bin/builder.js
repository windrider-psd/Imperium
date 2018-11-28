const builder = require('./../services/DBModelsBuilder')
const models = require("./../model/DBModels")
const yargs = require('yargs').argv

var forca = yargs.force ? yargs.force : true

console.log("Construindo a base de dados");

builder.ClearForeignKeys();

function criarReferenciasPlaneta(planetaId)
{
    let criarRecursos = () =>{
        models.RecursosPlanetarios.create({planetaID : planetaId})
        .catch(() => {
            criarRecursos()
        })
    }
    let criarFrota = () =>{
        models.Frota.create({planetaID : planetaId})
        .catch(() => {
            criarFrota()
        })
    }
    let criarEdificios = () =>{
        models.Edificios.create({planetaID : planetaId})
        .catch(() => {
            criarEdificios()
        })
    }

    criarEdificios()
    criarFrota()
    criarRecursos()
}
setTimeout(() =>
{
    builder.SyncDatabase(forca,  () =>
    {
        models.Planeta.afterCreate((intancia) => {
            criarReferenciasPlaneta(intancia.id)
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