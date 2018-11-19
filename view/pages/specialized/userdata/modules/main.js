const $ = require('jquery')
const utils = require('./../../../generic/modules/utils')
const observer = require('./../../../generic/modules/observer')
window.planeta = {}
window.setorinfo = {}
$(document).ready(function () {
	$.ajax({
		url: 'usuario/get-userdata',
		method: 'get',
		success: function (userdata) {
            window.userdata = userdata

            window.setorinfo = GetSetorInfo()
            window.planeta = window.setorinfo.planeta
			observer.Trigger('userdata-ready')
		},

		error: function (err) {
			utils.GerarNotificacao("Falha ao conseguir os dados de usuário: " + err.responseText, 'danger')
		}

	})
})


observer.Observar('userdata-ready', function () {
    
	if (planeta)
		$("#nome-planeta").text(planeta.nome);
	else
		utils.GerarNotificacao("Planeta não encontrado", 'danger');


    let selectstring = ""
    for (let i = 0; i < userdata.setores.length; i++)
    {
        let setor = userdata.setores[i]
        selectstring += '<optgroup label="' + setor.setor.nome + '[' + setor.setor.posX + ',' + setor.setor.posY + ']">';
        for (let j = 0; j < setor.planetas.length; j++)
        {
            if (setor.planetas[j].colonizado == true)
            {
                let selected = (planeta == setor.planetas[j].id) ? "selected" : ""
                selectstring += '<option value = "' + setor.planetas[j].id + '" ' + selected + '>' + setor.planetas[j].nome + '</option>'
            }
        }
        selectstring += "</optgroup>"
    }
    $("#select-planeta").html(selectstring)
    $('#select-planeta').select2(
    {
        width: '100%'
    });

	$(`#select-planeta option[value="${planeta.id}"]`).attr('selected', true)

	$('#select-planeta').on('change', function () {
		let val = $(this).val();
		let gets = utils.ParseGET(window.location.search.substring(1))
		gets['planetaid'] = val
		delete gets['']
		let url = window.location.pathname + "?"
		for (let get in gets) {
			url += get + '=' + gets[get] + "&"
		}
		url = url.slice(0, -1)

		window.location.href = url
	})
});

function GetSetorInfo(){
    if(typeof(userdata) === 'undefined')
        return null
    let info = {};
    let query = window.location.search.substring(1);
    let planetaid = utils.ParseGET(query).planetaid
    if(typeof(planetaid) === 'undefined')
    {
        for(let i = 0; i < userdata.setores[0].planetas.length; i++)
        {
            if(userdata.setores[0].planetas[i].colonizado == true)
            {
                info.planeta = userdata.setores[0].planetas[i];
                info.setor = userdata.setores[0].setor;

                return info
            }
        }
    }
    else
    {
        for(let i = 0; i < userdata.setores.length; i++)
        {
            let j;
            for(j = 0; j < userdata.setores[i].planetas.length; j++)
            {
                let planetaAtual = userdata.setores[i].planetas[j];
                if(planetaAtual.id == planetaid)
                {

                    info.planeta = planetaAtual;
                    info.setor = userdata.setores[i].setor;
                    return info
                }
            }
        }
    }
    return null
}

$(document).ready(function(){
    $("aside").on('click', "#logout-link", function()
    {
        $.ajax({
            url : "usuario/logout",
            method : "POST",
            success : function()
            {
                window.location.href = "/";
            },
            error : function(erro)
            {
                utils.GerarNotificacao(erro.responseText, "danger");
            }
        });
    });
})

module.exports = {GetSetorInfo : GetSetorInfo}