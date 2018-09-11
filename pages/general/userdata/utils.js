const $ = jQuery = require("jquery");
require('bootstrap-notify')
require("bootstrap-sass");
//const notify = require('bootstrap-notify')
const bootbox = require('bootbox')
$(function()
{
    var path = window.location.pathname;
    $('nav li a[href="'+path+'"]').parents('li').addClass('active');
});

function FormatarDate(data, separador)
{
    try
    {
        return data.getDate() + separador + (data.getMonth() + 1) + separador + data.getFullYear() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds();
    }
    catch(err)
    {
        data = new Date(data);
        return data.getDate() + separador + (data.getMonth() + 1) + separador + data.getFullYear() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds();
    }
        
}
function LimparObj(obj)
{
    for(var chave in obj)
    {
        if(typeof(obj[chave]) == "object")
        {
            LimparObj(obj[chave])
        }
        else if(typeof(obj[chave]) == "string")
        {
            obj[chave] = obj[chave].replace(/&/g, '&amp;').
            replace(/</g, '&lt;').  
            replace(/"/g, '&quot;').
            replace(/'/g, '&#039;');
        }
    }
}

function FormToAssocArray(JForm)
{
    var retorno = {};
    $("input", JForm).each(function()
    {
        if($(this).attr('type').toLowerCase() == 'checkbox')
        {
            var check = false;
            if($(this).is(':checked'))
            {
                check = true;
            }

            retorno[$(this).attr('name')] = check;
        }
        else
        {
            retorno[$(this).attr('name')] = $(this).val();
        }
    });
    $("textarea", JForm).each(function()
    {
        retorno[$(this).attr('name')] = $(this).val();
    });

    $("select", JForm).each(function()
    {
        retorno[$(this).attr('name')] = $('option:selected', $(this)).val();
    });
        
    return retorno;

}


function GerarNotificacao(mensagem, tipo)
{
    $(".alert").remove();
    $.notify({

    message: mensagem 
    },{
        element: 'body',
        position: null,
        type: tipo,
        allow_dismiss: true,
        newest_on_top: true,
        showProgressbar: false,
        placement: {
            from: "bottom",
            align: "center"
        },
        offset: 20,
        spacing: 10,
        z_index: 9999999,
        delay: 3000,
        timer: 1000,
        url_target: '_blank',
        mouse_over: null,
        animate: {
            enter: 'animated fadeInDown',
            exit: 'animated fadeOutUp'
        },
    });
}

function GerarConfirmacao(mensagem, __callback)
{
    bootbox.confirm({ 
    message: mensagem, 
    buttons: {
            cancel: {
                label: '<i class="fa fa-times"></i> Cancelar'
            },
            confirm: {
                label: '<i class="fa fa-check"></i> Confirmar'
            }
        },
        callback: function(resultado){ if(resultado == true){__callback();}
      }
    });
}

function parse_query_string(query) {
    var vars = query.split("&");
    var query_string = {};
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      var key = decodeURIComponent(pair[0]);
      var value = decodeURIComponent(pair[1]);
      // If first entry with this name
      if (typeof query_string[key] === "undefined") {
        query_string[key] = decodeURIComponent(value);
        // If second entry with this name
      } else if (typeof query_string[key] === "string") {
        var arr = [query_string[key], decodeURIComponent(value)];
        query_string[key] = arr;
        // If third or later entry with this name
      } else {
        query_string[key].push(decodeURIComponent(value));
      }
    }
    return query_string;
}


module.exports = {
    FormatarDate : FormatarDate,
    LimparObj : LimparObj,
    FormToAssocArray : FormToAssocArray,
    GerarNotificacao : GerarNotificacao,
    GerarConfirmacao : GerarConfirmacao,
    ParseGET : parse_query_string,
    GetSetorInfo : function()
    {
        let info = {};
        var query = window.location.search.substring(1);
        let planetaid = this.ParseGET(query).planetaid
        if(typeof(planetaid) === 'undefined')
        {
            for(let i = 0; i < userdata.setores[0].planetas.length; i++)
            {
                if(userdata.setores[0].planetas[i].colonizado == true)
                {
                    setor = userdata.setores[0].setor;

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
}