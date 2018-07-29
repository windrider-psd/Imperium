var models = require('./DBModels');
var cron = require('node-cron');
var i = 0;
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
                var updateFerro = (baseMinaFerro * planeta.minaFerro * 1.1 ^ planeta.minaFerro) + baseFerro + planeta.recursoFerro;
                models.Planeta.update({recursoFerro : updateFerro}, {where : {id : planeta.id}});
            });
            
        });
    }
    
})

module.exports = {
    Recursos : adicionarRecurso
}