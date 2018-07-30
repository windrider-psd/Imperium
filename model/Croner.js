var models = require('./DBModels');
var cron = require('node-cron');
var GerenciadorRecursos = require('./GerenciadorRecursos');
var adicionarRecurso = cron.schedule('*/10 * * * * *', function()
{
    if(models.isReady())
    {
        models.Planeta.findAll({where : {colonizado : true}}).then(function(planetas)
        {
            planetas.forEach(function(planeta)
            {
                var updateFerro = GerenciadorRecursos.ferro.GetProducao(planeta.minaFerro) + planeta.recursoFerro; 
                var updateCristal = GerenciadorRecursos.cristal.GetProducao(planeta.minaCristal) + planeta.recursoCristal;
                models.Planeta.update({recursoFerro : updateFerro, recursoCristal : updateCristal}, {where : {id : planeta.id}});
            });
        });
    }
    
})

module.exports = {
    Recursos : adicionarRecurso
}