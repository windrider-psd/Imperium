let $ = require('jquery')
require('bootstrap')
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
            utils.GerarNotificacao(err.responseText, "danger");
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
        
        let custoString = "";
        for(let recurso in prefab.custo)
        {
            custoString += `${recurso}:${prefab.custo[recurso]}<br />`
        }

        htmlString += 
        `
            <tr data-unidade="${unidade}" class = "unidade">
                <td>${prefab.nome}</td>
                <td>${custoString}</td>
                <td>${prefab.hp}</td>
                <td>${prefab.armadura}</td>
                <td>${prefab.escudo}</td>
                <td>${prefab.evasao}</td>
                <td>${prefab.capacidade_transporte}</td>
                <td>${prefab.velocidade}</td>
                <td>${prefab.dano}</td>
                <td>${prefab.quantidade_armas}</td>
                <td class = "total">${unidades[unidade]}</td>
                <td>
                    <button class = "btn btn-primary imperium-input btn-construir">Construir</button>
                    <button class = "btn btn-warning imperium-input btn-desmontar">Desmontar</button>
                </td>
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

    $("#table-unidades").on('click', ".btn-construir", function()
    {
        let unidade = $(this).parent().parent().data('unidade')

        $(`#form-construir-unidade input[name="unidade"]`).val(unidade)
        $("#modal-construir-unidade").modal('show')
    })

    $("#form-construir-unidade").on('submit', function() {
        let params = utils.FormToAssocArray($(this))
        params['planetaid'] = window.planeta.id
        $.ajax({
            url : "militar/frota",
            method : "PUT",
            data: params,
            success : () => {
                console.log("sucesso")
            },
            error : (err) => {
                utils.GerarNotificacao(err.responseText, "danger");
            }
        })
    })

})