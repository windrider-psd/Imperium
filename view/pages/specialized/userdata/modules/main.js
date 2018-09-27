const $ = require('jquery')
const utils = require('./../../../generic/modules/utils')
const observer = require('./../../../generic/modules/observer')
let planeta

$(document).ready(function () {
	$.ajax({
		url: 'usuario/get-userdata',
		method: 'get',
		success: function (userdata) {
			window.userdata = userdata
			observer.Trigger('userdata-ready')
		},

		error: function (err) {
			utils.GerarNotificacao("Falha ao conseguir os dados de usuário: " + err.responseText, 'danger')
		}

	})
})


observer.Observar('userdata-ready', function () {
	planeta = GetSetorInfo().planeta
	if (planeta)
		$("#nome-planeta").text(planeta.nome);
	else
		utils.GerarNotificacao("Planeta não encontrado", 'danger');


	$("#select-planeta option[value='" + planeta.id + "']").attr('selected', true)

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

module.exports = {GetSetorInfo : GetSetorInfo}