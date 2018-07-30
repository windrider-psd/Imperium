const baseFerro = Math.ceil(60 / 6);
const baseMinaFerro = Math.ceil(90 / 6);


const baseCristal = Math.ceil(25 / 6);
const baseMinaCristal = Math.ceil(55 / 6);

///Ferro

GetProducaoFerro = function (nivelMinaFerro)
{
   return (baseMinaFerro * nivelMinaFerro * 1.1 ^ nivelMinaFerro) + baseFerro
}

GetCustoUpgradeMinaFerro = function (nivelMinaFerro)
{
    var custoFerro = Math.ceil((172 * (1.6 ^ (nivelMinaFerro - 1))));
    var custoCristal = Math.ceil((65 * (1.4  ^ (nivelMinaFerro - 1))));
    return {ferro : custoFerro, cristal : custoCristal};
}

// Cristal
GetProducaoCristal = function (nivelMina)
{
   return (baseMinaCristal * nivelMina * 1.1 ^ nivelMina) + baseCristal
}

GetCustoUpgradeMinaCristal = function (nivelMina)
{
    var custoFerro = Math.ceil((185 * (1.5 ^ (nivelMina - 1))));
    var custoCristal = Math.ceil((92 * (1.5  ^ (nivelMina - 1))));
    return {ferro : custoFerro, cristal : custoCristal};
}




module.exports ={
    ferro :
    {
        GetProducao : GetProducaoFerro,
        GetCustoUpgradeMina : GetCustoUpgradeMinaFerro,
    },
    cristal :
    {
        GetProducao : GetProducaoCristal,
        GetCustoUpgradeMina : GetCustoUpgradeMinaCristal
    }
}
