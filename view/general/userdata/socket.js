const io = require('socket.io-client')
const observer = require('./../observer')
observer.Observar('userdata-ready', function ()
{
	socket = io.connect(userdata.WebServer.ip + ":" + userdata.WebServer.IOPort)
	socket.on('connect', function ()
	{
		observer.Trigger('socket.ready')
		socket.emit('init', userdata.sessionID);
	});


})