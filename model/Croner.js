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
                var updateFerro = GerenciadorRecursos.GetProducaoFerro(planeta.minaFerro) + planeta.recursoFerro; 
                var updateCristal = GerenciadorRecursos.GetProducaoCristal(planeta.minaCristal) + planeta.recursoCristal;
                models.Planeta.update({recursoFerro : updateFerro, recursoCristal : updateCristal}, {where : {id : planeta.id}});
            });
        });
    }
    
})

module.exports = {
    Recursos : adicionarRecurso
}