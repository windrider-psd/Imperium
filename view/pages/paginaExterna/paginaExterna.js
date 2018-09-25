const $ = require('jquery')
const BBCodeParser = require('bbcode-parser')
const observer = require('./../../general/observer')
let parser = new BBCodeParser(BBCodeParser.defaultTags());
let utils = require('./../../general/userdata/utils')

observer.Observar('userdata-ready',  function (){

    let gets = utils.ParseGET(window.location.search.substring(1))
    function getAliancaData(id)
    {
        return new Promise(resolve => {
            $.ajax({
                url : 'alianca/get-aliancadata',
                method : 'GET',
                data : {id : id},
                accepts : "JSON",
                success : function(alianca)
                {
                    resolve(alianca)
                    $(".td-nome").text(alianca.nome)
                    $(".imperium-title span").text(alianca.nome)
                    $(".td-tag").text(alianca.tag)
                    $(".td-contagem").text(alianca.totalMembros)
                    $("title").text(alianca.nome + " - Imperium")
                    let paginaExterna = (alianca.paginaExterna != null) ? alianca.paginaExterna : ""
                    $("#pagina-externa").html(parser.parseString(paginaExterna))

                }
            })
        })
    }
    getAliancaData(gets['id'])
        .then(alianca => {

            if(userdata.alianca == null)
            {
                $.ajax({
                    url : 'alianca/get-aplicacao-alianca',
                    method : 'GET',
                    accepts : "JSON",
                    success : function(aplicacao)
                    {
                        if(aplicacao == null)
                        {
                            let template = (alianca.template != null) ? alianca.template : ""
                            $("#aplicacao-text").val(template)
                            
                            $("#row-btn-enviar-aplicacao").removeClass("hidden")
                            $("#btn-enviar-aplicacao").on('click', function()
                            {
                                $("#modal-aplicacao").modal("show");
                            })

                            $("#modal-aplicacao form").on('submit', function(){
                                var params = utils.FormToAssocArray($(this))
                                var btn = $(this).find("button")
                                params.alianca = gets['id']
                                $.ajax({
                                    url : 'alianca/aplicar-alianca',
                                    method : 'POST',
                                    data : params,
                                    beforeSend : function()
                                    {
                                        btn.text("Enviando...")
                                    },
                                    success : function()
                                    {
                                        utils.GerarNotificacao("Aplicação enviada com sucesso", 'success')
                                    },
                                    error : function(err)
                                    {
                                        utils.GerarNotificacao(err.responseText, 'danger')
                                    },
                                    complete : function()
                                    {
                                        btn.text("Enviar")
                                    }
                                })
                            })
                        }
                    }
                })
            }
           
        })
    
    

})