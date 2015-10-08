var ws = require("nodejs-websocket");
var config = require("./config/config.js");
var express = require('express');

var setHeartbeat = function(connection, time) {
    connection.sendText("H");
    setInterval(function() {
        connection.sendText("H");
    }, time * 1000);
}

console.log("Starting Websocket Server at ws://localhost:" + config.websocketPort);
var server = ws.createServer(function(conn) {
    console.log("New connection Established");
    setHeartbeat(conn, 5);

    conn.on("text", function(str) {
        console.log("Received " + str);
        conn.sendText(str.toUpperCase() + "!!!");
    })
    conn.on("close", function(code, reason) {
        console.log("Connection closed");
    })
}).listen(config.websocketPort);

var app = express();

app.get('/', function(req, res) {
    console.log("Received GET CALL - " + req.query.data);
    var str = req.query.data;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send("GetCall Data - " + str.toUpperCase() + "!!!");
});

var server = app.listen(config.getPort, function() {
    var port = server.address().port;

    console.log('GetApp Listening at http://localhost:' + port);
});