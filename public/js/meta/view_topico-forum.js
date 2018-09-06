var isLider
var tamanhoPaginas
var atualizar = true
$(document).ready(function() {
    if(userdata.alianca != null)
    {
        isLider = userdata.session.id == userdata.alianca.lider
    }
    else 
        isLider = false

    getMensagens(1)
    function getMensagens (pagina)
    {
        $.ajax({
            url :'alianca/get-mensagens-topico',
            method : "GET",
            data : {pagina : pagina, topico : qs.topicoid},
            success : function(resposta)
            {   
                let mensagens = resposta.mensagens
                let total = resposta.total
                let tamanhoPaginas = resposta.tamanhoPaginas
                let htmlString = ''
                for(let i = 0; i < mensagens.length; i++)
                {
                    htmlString += '<h4><b>'+mensagens[i].usuario.nick+'</b></h4>'
                    htmlString += '<p>'+mensagens[i].conteudo.replace(/(?:\r\n|\r|\n)/g, '<br />')+'</p>'
                    htmlString += '<hr>'
                }
                $("#mensagens-conteudo").html(htmlString)
            },
            error : function(err)
            {
                GerarNotificacao(err.responseText, 'danger')
            }
        })
    }
    $("#form-inserir-mensagem-forum").on('submit', function()
    {
        let params = FormToAssocArray($(this))
        params['topico'] = qs.topicoid

        $.ajax({
            url :'alianca/inserir-mensagem-topico',
            method : "POST",
            data : params,
            success : function()
            {
                GerarNotificacao("Mensagen postada com sucesso", 'success')
            },
            error : function(err)
            {
                GerarNotificacao(err.responseText, 'danger')
            }
        })
    })
    

    
})
