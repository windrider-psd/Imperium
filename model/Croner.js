var models = require('./DBModels');
var cron = require('node-cron');
var GerenciadorRecursos = require('./GerenciadorRecursos');
const baseFerro = Math.ceil(60 / 6);
const baseMinaFerro = Math.ceil(45 / 6);
var adicionarRecurso = cron.schedule('*/10 * * * * *', function()
{
    if(models.isReady())
    {
        models.Planeta.findAll({where : {colonizado : true}}).then(function(planetas)
        {
            planetas.forEach(function(planeta)
            {
                var updateFerro = GerenciadorRecursos.GetProducaoFerro(planeta.minaFerro) + planeta.recursoFerro; 
                models.Planeta.update({recursoFerro : updateFerro}, {where : {id : planeta.id}});
            });
        });
    }
    
})

module.exports = {
    Recursos : adicionarRecurso
}