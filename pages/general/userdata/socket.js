const io = require('socket.io-client')
const $ = require('jquery')
socket = io.connect(ip+":"+ioPort)

$(document).ready(function ()
{
  socket.on('connect', function()
  {
    socket.emit('init', userdata.sessionID);
  });
})