
/**
 * 
 * @param {number} destinatario O id do destinatário
 * @param {string} titulo O titulo auxiliar. Recomendado que seja o nome do jogador
 * @description Abre o modal para envio de mensagem privada
 */
function AbrirModalEnviarMensagemPrivada(destinatario, titulo)
{
    $("#modal-enviar-mensagem-privada .modal-title span").text(titulo);
    $("#form-enviar-mensagem-privada input[name='destinatario']").val(destinatario);
    $("#modal-enviar-mensagem-privada").modal('show');
}

$("#form-enviar-mensagem-privada").on('submit', function()
{
    var params = FormToAssocArray($(this));
    var btn = $(this).find("button");
    $.ajax({
        url : 'comunicacao/enviar-mensagem-privada',
        method : 'POST',
        data : params,
        beforeSend : function()
        {
            btn.text("Enviando...")
        },
        success : function()
        {
            GerarNotificacao("Mensagem enviada com sucesso", 'success')
        },
        error : function(err)
        {
            GerarNotificacao(err.responseText, 'danger')
        },
        complete : function()
        {
            btn.text("Enviar Mensagem")
        }
    })
});