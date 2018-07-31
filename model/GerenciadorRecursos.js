const baseFerro = Math.ceil(60 / 6);
const baseMinaFerro = Math.ceil(90 / 6);


const baseCristal = Math.ceil(25 / 6);
const baseMinaCristal = Math.ceil(55 / 6);

const baseEnergia = 100;

///Ferro
function GetProducaoFerro(nivelMinaFerro)
{
   return Math.ceil(baseMinaFerro * nivelMinaFerro * Math.pow(1.1, nivelMinaFerro)) + baseFerro
}

function GetCustoUpgradeMinaFerro (nivelMinaFerro)
{
    var custoFerro = Math.ceil((172 * Math.pow(1.6, (nivelMinaFerro - 1))));
    var custoCristal = Math.ceil((65 * Math.pow(1.4, (nivelMinaFerro - 1))));
    return {ferro : custoFerro, cristal : custoCristal};
}

// Cristal
function GetProducaoCristal (nivelMina)
{
   return Math.ceil((baseMinaCristal * nivelMina * 1.1 ^ nivelMina)) + baseCristal
}

function GetCustoUpgradeMinaCristal (nivelMina)
{
    var custoFerro = Math.ceil((185 * Math.pow(1.5, (nivelMina - 1))));
    var custoCristal = Math.ceil((92 * Math.pow(1.5, (nivelMina - 1))));
    return {ferro : custoFerro, cristal : custoCristal};
}

// Energia

    //Planta Solar
    function GetProducaoEnergiaPlantaSolar (nivelPlanta, intensidadeSolarPlaneta)
    {
        return Math.ceil(((35 * nivelPlanta * (1.1 ^ nivelPlanta)) * (intensidadeSolarPlaneta / 100)));
    }

    function GetProducaoEnergiaReatorFusao(nivelReator)
    {
        return Math.ceil(((90 * nivelReator * Math.pow(1.1, nivelReator))));
    }

    /**
     * @param {number} nivelPlanta O nível da planta solar do planeta
     * @param {number} nivelReator O nível do reator de fusao do planeta
     * @param {Object} posSol A posição x e y do sol do sistema
     * @param {Object} posPlaneta A posicao x e y do planeta
     * @param {number} instensidadeSol A intensidade solar do sistema
     * @description Calcula a produção de energia do planeta
     * @returns {number} A produção de energia do planeta
     */

    function GetEnergia(nivelPlanta, nivelReator, posSol, posPlaneta, instensidadeSol)
    {
        var intensidadeSolarPlaneta = GetIntensidadeSolarPlaneta(posSol, posPlaneta, instensidadeSol);
        return GetProducaoEnergiaPlantaSolar(nivelPlanta, intensidadeSolarPlaneta) + GetProducaoEnergiaReatorFusao(nivelReator) + baseEnergia;
    }

    /**
     * @param {Object} posSol A posição x e y do sol do sistema
     * @param {Object} posPlaneta A posicao x e y do planeta
     * @param {number} instensidadeSol A intensidade solar do sistema
     * @description Calcula a intensidade solar que um planeta recebe
     * @returns {number} Intensidade em Integer
     */
    function GetIntensidadeSolarPlaneta (posSol, posPlaneta, instensidadeSol)
    {
        var distancia = 0;
        var x = posSol.x
        var y = posSol.y
        while(true)
        {
            if(x == posPlaneta.x && y == posPlaneta.y)
            {
                break;
            }
            if(x < posPlaneta.x)
            {
                x++;
            }
            else if(x > posPlaneta.x)
            {
                x__;
            }
            if(y < posPlaneta.y)
            {
                y++;
            }
            else if(x > posPlaneta.y)
            {
                y--;
            }
            distancia++;
        }
        return instensidadeSol - ( 9 * distancia);
    }

(function(exports){

    exports.GetProducaoFerro = GetProducaoFerro,
    exports.GetCustoUpgradeMinaFerro = GetCustoUpgradeMinaFerro,

    exports.GetProducaoCristal = GetProducaoCristal,
    exports.GetCustoUpgradeMinaCristal = GetCustoUpgradeMinaCristal,

    exports.GetIntensidadeSolarPlaneta = GetIntensidadeSolarPlaneta,
    exports.GetProducaoEnergiaPlantaSolar = GetProducaoEnergiaPlantaSolar,
    exports.GetProducaoEnergiaReatorFusao = GetProducaoEnergiaReatorFusao,
    exports.GetEnergia = GetEnergia


}(typeof exports === 'undefined' ? this.GerenciadorRecursos = {} : exports));