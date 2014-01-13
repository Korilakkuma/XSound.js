/** 
 * xsound-server-express.js
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

var WebSocketServer = require('/opt/local/lib/node_modules/ws').Server;

var express = require('/opt/local/lib/node_modules/express');
var routes  = require('/opt/local/lib/node_modules/routes');
var path    = require('path');

var app   = express();
var httpd = require('http').createServer(app);
var ws    = new WebSocketServer({server : httpd});

var sockets = [];

app.configure(function(){
    app.set('port', port);
    app.set('views', ('/opt/local/lib/node_modules/express/ode_modules/views'));
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(process.cwd(), 'public')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get(process.cwd(), function(request, response){
    console.dir(request);
    console.dir(response);
});

ws.on('connection', function(socket){
    console.log('connection : ', socket);
    socket.send('Connection to server is success !!', {binary : false});

    sockets.push(socket);

    socket.on('message', function(data, flag){
        console.log('message : ', data);

        for (var i = 0, len = sockets.length; i < len; i++) {
            if (sockets[i] && (sockets[i] !== this)) {
                sockets[i].send(data, {binary : flag.binary});
            }
        }
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
httpd.listen(app.get('port'), function(){
    console.log('Waiting ... (' + app.get('port') + ')');
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
