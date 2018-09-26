const $ = require('jquery')
const utils = require('./utils')
const observer = require('./../observer')

observer.Observar('userdata-ready',  function (){
    if(userdata.alianca != null)
    {
        $("#aside-menu-forum").removeClass('hidden')
    }
    let planeta = utils.GetSetorInfo().planeta
    var path = window.location.pathname;
    let ativo = $('aside a[href="'+path+'"]').find('li')
    ativo.addClass('ativo');
    $(".link-planeta").each(function()
    {
        let _url = $(this).attr('href');
        _url += (_url.split('?')[1] ? '&':'?') + 'planetaid=' + planeta.id;
        $(this).attr('href', _url)
    })

    $("#nav-nick").html(userdata.session.nick)

    let textorank = $("#link-ranking span");
    textorank.text(textorank.text()  + " (" + userdata.rank + ")")

    let textomensagem = $("#link-mensagens span");
    textomensagem.text(textomensagem.text()  + " (" + userdata.caixaEntrada + ")")
    

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

    function getPedidosDeAmizade()
    {
        
    }

    $("#link-convites li").on('click', function(){
        $("#modal-convites").modal('show');
        getConvitesAlianca();
    })

    function getConvitesAlianca()
    {
        $.ajax({
            url : '/alianca/getConvites',
            method : 'GET',
            success : function(convites)
            {
                /** 
                @type {Array.<{aliancaID : number, aliancaNome : string, aliancaTag : string, mensagem : string}>}
                */
                convites
                let htmlString = ""
                for(var i = 0; i <  convites.length; i++)
                {
                    let  mensagemString = convites[i].mensagem.replace(/\n\s*\n/g, '\n').replace(/\n/g, '<br />');
                    htmlString += '<div class = "table-responsive"><table class = "table table-striped"><tbody>'
                        + '<tr><th>Aliança: </th><td>'+convites[i].aliancaNome+'</td></tr>'
                       // + '<tr><th colspan = "2">Mensagem: </th></tr>'
                        + '<tr><td colspan = "2">'+mensagemString+'</td></tr>'
                        + '<tr><td colspan = "2"><a href = "paginaExterna?id='+convites[i].aliancaID+'">Página da aliança</a></td></tr>'
                        + '</tbody></table><button type = "button" class = "btn btn-success btn-aceitar-convite" data-id = "'+convites[i].aliancaID+'">Aceitar</button><button type = "button" class = "btn btn-danger btn-recusar-convite" data-id = "'+convites[i].aliancaID+'">Recursar</button></div>'
                }
                $(".tab-content-convite").html(htmlString)
                $("#tab-convites").addClass('active')
                

            },
            error : function(err)
            {
                utils.GerarNotificacao("Houve um erro para ler os convites de aliança", 'danger')
            }
        })
    }

    $(".tab-content-convite").on('click', '.btn-aceitar-convite', function()
    {
        var aliancaID = $(this).data('id');
        $.ajax({
            url : '/alianca/aceitar-convite',
            method : 'POST',
            data : {valor : 1, aliancaID : aliancaID},
            success : function()
            {
                location.reload(true)
            },
            error : function(err)
            {
                utils.GerarNotificacao("Houve um erro ao aceitar o convite: " + err.responseText, 'danger')
            }
        })
    })

    $(".tab-content-convite").on('click', '.btn-recusar-convite', function()
    {
        var aliancaID = $(this).data('id');
        var div = $(this).parent();
        $.ajax({
            url : '/alianca/aceitar-convite',
            method : 'POST',
            data : {valor : 0, aliancaID : aliancaID},
            success : function()
            {
                div.remove()
                utils.GerarNotificacao("Convite recusado com sucesso", 'success')
            },
            error : function(err)
            {
                utils.utils.GerarNotificacao("Houve um erro ao aceitar o convite: " + err.responseText, 'danger')
            }
        })
    })
    var estado_menu = 0;
    $("#abrir_menu_div").on('click', function() {
        if (estado_menu == 0) {
            $("#abrir_menu_div_seta").css("display", "none");
            $("#abrir_menu_div_fechar").css("display", "block");
            $("aside").css("width", "100%");
            estado_menu = 1;
        } else {

            $("#abrir_menu_div_seta").css("display", "block");
            $("#abrir_menu_div_fechar").css("display", "none");
            $("aside").css("width", "");
            estado_menu = 0;
        }
    });
})