const io = require('socket.io-client')
let $ = require('jquery')
const observer = require('./../observer')
observer.Observar('userdata-ready',  function(){
  socket = io.connect(ip+":"+ioPort)
  socket.on('connect', function()
  {
    observer.Trigger('socket.ready')
    socket.emit('init', userdata.sessionID);
  });
  

})