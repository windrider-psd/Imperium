let $ = require('jquery')
const observer = require('./../../../../generic/modules/observer')
const utils = require('./../../../../generic/modules/utils')
const navePrefabs = require('./../../../../../../prefabs/Nave')
function getMilitar(planetaID, callback = () => {})
{
    $.ajax({
        url : "militar/frota",
        method : "GET",
        data: {planetaid : planetaID},
        dataType : "JSON",
        success : (unidades) => {
            callback(unidades)
        },
        error : (err) => {
            utils.GerarNotificacao(err.responseText, "error");
        }
    })
}

function encontrarPrefab(nomeTabela)
{
    for(let prefab in navePrefabs)
    {
        let obj = navePrefabs[prefab];
        if(nomeTabela == obj.nome_tabela)
        {
            return obj;
        }
    }
    return null
}

function montarHTMLUnidades(unidades)
{
    let htmlString = "";
    for(let unidade in unidades)
    {

        let prefab = encontrarPrefab(unidade)
        
        htmlString += 
        `
            <tr>
                <td>${prefab.nome}</td>
                <td>${prefab.hp}</td>
                <td>${prefab.armadura}</td>
                <td>${prefab.escudo}</td>
                <td>${prefab.evasao}</td>
                <td>${prefab.capacidade_transporte}</td>
                <td>${prefab.velocidade}</td>
                <td>${prefab.dano}</td>
                <td>${prefab.quantidade_armas}</td>
                <td>${unidades[unidade]}</td> <!--total-->
                <td></td>
            </tr>
        `
    }
    return htmlString;
}

observer.Observar('userdata-ready',  () => {
    getMilitar(window.planeta.id, (unidades) => {
        delete unidades.operacaoID
        delete unidades.planetaID
        delete unidades.relatorioID
        delete unidades.id
        delete unidades.usuarioID
        let htmlUnidades = montarHTMLUnidades(unidades);
        $("#table-unidades tbody").html(htmlUnidades);
    })
})