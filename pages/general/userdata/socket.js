const io = require('socket.io-client')
let $ = require('jquery')
socket = io.connect(ip+":"+ioPort)

socket.on('connect', function()
{
  socket.emit('init', userdata.sessionID);
});