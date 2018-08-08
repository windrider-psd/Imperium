var query = window.location.search.substring(1);
var qs = parse_query_string(query);
var planeta = null;
var setor = null;
var posSolObj = null;
var posPlanetaObj = null;
var idPlaneta;

for(let i = 0; i < userdata.setores.length; i++)
{
    let j;
    for(j = 0; j < userdata.setores[i].planetas.length; j++)
    {
        let planetaAtual = userdata.setores[i].planetas[j];
        if(planetaAtual.id == qs.id)
        {
            planeta = planetaAtual;
            setor = userdata.setores[i].setor;
            posSolObj = {x : setor.solPosX, y : setor.solPosY};
            posPlanetaObj = {x : planeta.posX, y : planeta.posY};
            idPlaneta = qs.id;
            break;
        }
    }
}