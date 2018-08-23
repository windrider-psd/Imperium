const ip = require('ip')
const socketio = require('socket.io')
const sessaosocket = require('express-socket.io-session')
/**
 * @type {Array.<Array.<SocketIO.Socket>>}
 */
var clientes = new Array();

/**
 * @type {SocketIO.Server}
 */
var servidor;
var redisStore;

/**
 * @param {string} idcliente O id do cliente (banco de dados)
 * @param {SocketIO.Socket} socket O socket que será associado com o id do cliente
 * @description Associa o socket com o idclietne
 * @returns {void}
 */
function AdicionarCliente(idcliente, socket)
{
    let cliente = clientes[idcliente];
    if(!cliente)
    {
        clientes[idcliente] = new Array();
        cliente = clientes[idcliente]
    }   
    cliente.push(socket);
}
/**
 * @param {string} idcliente O id do cliente (banco de dados)
 * @param {SocketIO.Socket} socket O socket que será removido
 * @description Remove a associação do socket com o idcliente
 * @returns {void}
 */
function RemoverCliente(idcliente, socket)
{
    let cliente = clientes[idcliente];
    if(typeof(cliente) !== 'undefined')
    {
        for(let i = 0; i <= cliente.length; i++)
        {
            if(cliente[i].handshake.sessionID == socket.handshake.sessionID)
            {
                cliente.splice(i, 1);
                break;
            }
        }
        if(cliente.length == 0)
        {
            clientes.splice(clientes.indexOf(cliente), 1);
        }
    }
    
}


/**
 * @param {Express.Application} express_app O app do express
 * @param {number} porta A porta do socket.io
 * @param {Object} sessaomiddleware A middleware de sessão do app
 * @param {Object} armazenadorSessao O que armazena os dados da sessão
 * @description Cria um servidor socket.io
 * @returns {SocketIO.Server}
 */
function CriarSocket(express_app, porta, sessaomiddleware, armazenadorSessao)
{
    let http = require('http').Server(express_app);
    http.listen(porta, ip.address());
    servidor = socketio(http);
    servidor.use(sessaosocket(sessaomiddleware, {autoSave : true}));
    redisStore = armazenadorSessao;
    SetUpServidor();
    return servidor;
}

/**
 * @description Faz o setup do servidor socket.io
 * @returns {void}
 */
function SetUpServidor()
{
    servidor.on('connection', (socket) =>
    {
        socket.on('init', (idSessao) =>
        {
            redisStore.get(idSessao, (err, sessao) =>
            {
                if(err) console.log(err)
                else if(typeof(sessao) !== 'undefined')
                {
                    socket.handshake.session.clienteid = sessao.usuario.id
                    AdicionarCliente(sessao.usuario.id, socket);
                }
            });

        });
        socket.on('disconnect', () =>{
            RemoverCliente(socket.handshake.session.clienteid, socket);
        });
    })
}
/**
 * 
 * @param {number} idcliente O id do cliente (banco de dados) 
 * @param {string} evento
 * @param {any} mensagem 
 * @description Emite eventos para todos os sockets do cliente com o id idcliente
 * @returns {void}
 */
function EmitirParaSessao(idcliente, evento, mensagem)
{
    let cliente = clientes[idcliente];
    if(cliente)
    {
        for(let i = 0; i < cliente.length; i++)
        {
            cliente[i].emit(evento, mensagem);
        }
    }
}

/**
 * @param {number} idcliente O id (banco de dados) do usuário
 * @description Verifica se um usuário está online]
 * @returns {boolean} Verdadeiro se online. Falso se offline
 */
function isOnline(idusuario)
{
    let cliente = clientes[idusuario];
    return typeof(cliente) !== 'undefined'
}

module.exports = {
    CriarSocket : CriarSocket,
    EmitirParaSessao : EmitirParaSessao,
    isOnline : isOnline
}