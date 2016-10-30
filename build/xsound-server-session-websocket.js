/**
 * xsound-server-session-websocket.js
 * @fileoverview WebSocketServer
 *
 * Copyright 2013, 2014@Tomohiro IKEDA
 * Released under the MIT license
 */



'use strict';

process.stdout.setEncoding('UTF-8');
process.stderr.setEncoding('UTF-8');

var port = 8000;

if (process.argv.length >= 3) {
    var p = parseInt(process.argv[2]);

    if ((p >= 0) || (p <= 65535)) {
        port = p;
    }
}

var log = '';

if (process.argv.length >= 4) {
    log = process.argv[3];
}

var fs = require('fs');

var appendLog = function(message, line) {
    if (log === '') {
        return;
    }

    var format = function(number) {
        return ('0' + number).slice(-2);
    };

    var date = new Date();
    var y    = date.getFullYear();
    var m    = format(date.getMonth() + 1);
    var d    = format(date.getDate());
    var h    = format(date.getHours());
    var i    = format(date.getMinutes());
    var s    = format(date.getSeconds());
    var time = y + '-' + m + '-' + d + ' ' + h + ':' + i + ':' + s;

    var record = time + '\tLINE ' + line + '\t' + String(message) + '\n';

    fs.appendFile(log, record, function(error) {
        if (error) {
            process.stderr.write('LINE 60 :' + error.message + '\n');
        }
    });
};

// Create the instance of WebSocketServer
var WebSocketServer = require('websocket').server;
var http            = require('http');
var httpd           = http.createServer();
var ws              = new WebSocketServer({httpServer : httpd/*, autoAcceptConnections : true */});

var sockets = [];

ws.on('request', function(request) {
    appendLog('request', '070');
    request.accept(null, null);
});

ws.on('connect', function(socket) {
    appendLog('connect', '075');
    socket.sendUTF('Connection to server is success !!');

    sockets.push(socket);

    socket.on('message', function(data) {
        for (var i = 0, len = sockets.length; i < len; i++) {
            if (sockets[i] !== this) {
                switch (data.type) {
                    case 'utf8':
                        sockets[i].send(data.utf8Data);
                        break;
                    case 'binary':
                        sockets[i].send(data.binaryData);
                        break;
                    default:
                        break;
                }
            }
        }
    });

    socket.on('close', function() {
        for (var i = 0, len = sockets.length; i < len; i++) {
            if (sockets[i] === this) {
                appendLog('close', '100');

                sockets[i].removeAllListeners('message');
                sockets[i].removeAllListeners('close');

                sockets.splice(i, 1);

                break;
            }
        }
    });
});

// Start HTTP server and WebSocket server
httpd.listen(port, function() {
    process.stdout.write('Waiting ... (' + port + ')\n');
});

// Signal Handler
process.on('SIGINT', function() {
    process.stdout.write('This process caught signal number 2 (SIGINT). Therefore, (' + process.pid + ') was terminated.\n');
    process.exit(0);
});

// Catch Exception
process.on('uncaughtException', function(error) {
    appendLog(error.message, '126');
    process.stderr.write('LINE 127 :' + error.message + '\n');
});
