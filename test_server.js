#!/usr/bin/env node
var websocket = require('websocket');
var WebSocketServer = websocket.server;
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');

var mimeTypes = {
    "js": "text/javascript",
    "html": "text/html",
    "json": "application/json",
    "png": "image/png",
    "jpg": "image/jpeg"
}

var server = http.createServer(function(req, res) {
    var uri = url.parse(req.url).pathname;
    if (uri=='/') { uri = 'index.html' }
    var fn = path.join(process.cwd(), uri);
    fs.exists(fn, function(e){
        if (!e) {
            console.log((new Date()) + ' Received request for ' + req.url);
            res.writeHead(404);
            res.end();
            return;
        }
        res.writeHead(200, {'Content-Type': mimeTypes[path.extname(fn).split(".")[1]]});
        var fss = fs.createReadStream(fn);
        fss.pipe(res);
    });
});

server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});
