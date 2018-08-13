
getInbox(1);
getOutbox(1);

function getInbox(pagina)
{
    $.ajax({
        url : 'comunicacao/getInbox',
        method : "GET",
        data : {pagina : pagina},
        success : function(inbox)
        {
            console.log("inbox:")
            console.log(inbox)
        },
        error : function (err)
        {
            console.log(err.responseText);
        }
    })
}

function getOutbox(pagina)
{
    $.ajax({
        url : 'comunicacao/getOutbox',
        method : "GET",
        data : {pagina : pagina},
        success : function(inbox)
        {
            console.log("outbox:")
            console.log(inbox)
        },
        error : function (err)
        {
            console.log(err.responseText);
        }
    })
}