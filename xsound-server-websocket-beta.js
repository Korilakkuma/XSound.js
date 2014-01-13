/** 
 * xsound-server-websocket.js
 * @fileoverview WebSocketServer
 *
 * Copyright 2013@Tomohiro IKEDA
 * Released under the MIT license
 */
 
 
 
var port = 8000;

if (process.argv.length >= 3) {
    var p = parseInt(process.argv[2]);

    if ((p >= 0) || (p <= 65535)) {
        port = p;
    }
}

var WebSocketServer = require('/opt/local/lib/node_modules/websocket').server;

var httpd = require('http').createServer();
var ws    = new WebSocketServer({
  'httpServer' : httpd
  //'autoAcceptConnections' : true
});

var sockets = [];

ws.on('request', function(request){
    console.log('request : ', request);
    request.accept(null, null);
});

ws.on('connect', function(socket){
    console.log('connect : ', socket);
    socket.sendUTF('Connection to server is success !!');

    sockets.push(socket);

    socket.on('message', function(data){
        console.log('message : ', data);

        for (var i = 0, len = sockets.length; i < len; i++) {
            if (sockets[i] && (sockets[i] !== this)) {
                switch (data.type) {
                    case 'utf8' :
                        sockets[i].send(data.utf8Data);
                        break;
                    case 'binary' :
                        sockets[i].send(data.binaryData);
                        break;
                    default :
                        break;
                }
            }
        }

        //Broadcast
        //
        //switch (data.type) {
        //    case 'utf8' :
        //        ws.broadcast(data.utf8Data);
        //        break;
        //    case 'binary' :
        //        ws.broadcast(data.binaryData);
        //        break;
        //    default :
        //        console.log('Unknown data type : ', data.type);
        //        break;
        //}
    });

    socket.on('close', function(){
        for (var i = 0, len = sockets.length; i < len; i++) {
            if (sockets[i] && (sockets[i] === this)) {
                console.log('close : ', sockets[i]);

                sockets[i].removeAllListeners('message');
                sockets[i].removeAllListeners('close');

                sockets.splice(i, 1);

                return;
            }
        }
    });
});

//Start HTTP server and WebSocket server
httpd.listen(port, function(){
    console.log('Waiting ... (' + port + ')');
});

//Signal Handler
process.on('SIGINT', function(){
    console.log('This process caught signal number 2 (SIGINT). Therefore, (' + process.pid + ') was terminated.');
    process.exit(0);
});

//Catch Exception
process.on('uncaughtException', function(error){
    console.error(error.message);
    process.exit(1);
});
