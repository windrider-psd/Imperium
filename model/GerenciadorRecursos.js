const baseFerro = Math.ceil(60 / 6);
const baseMinaFerro = Math.ceil(90 / 6);


GetProducaoFerro = function (nivelMinaFerro)
{
   return (baseMinaFerro * nivelMinaFerro * 1.1 ^ nivelMinaFerro) + baseFerro
}


module.exports ={
    GetProducaoFerro : GetProducaoFerro
}
