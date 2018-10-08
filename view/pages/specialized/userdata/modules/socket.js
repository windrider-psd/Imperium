const io = require('socket.io-client')
const observer = require('./../../../generic/modules/observer')
observer.Observar('userdata-ready',  () =>
{
	window.socket = io.connect(userdata.WebServer.ip + ":" + userdata.WebServer.IOPort)
	socket.on('connect',  () =>
	{
		observer.Trigger('socket-ready')
		socket.emit('init', userdata.sessionID);
	});


})