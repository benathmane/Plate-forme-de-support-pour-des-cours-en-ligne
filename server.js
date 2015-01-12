var static  = require('node-static');
var http    = require("http");              // http server core module
var express = require("express");           // web framework external module
var io      = require("socket.io");         // web socket external module
var easyrtc = require("easyrtc");  

var httpApp = express();         // EasyRTC external module

var file = new(static.Server)();
var app = http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(2015);

// Start Socket.io so it attaches itself to Express server
var socketServer = io.listen(app, {"log level":1});

// Start EasyRTC server
var rtc = easyrtc.listen(httpApp, socketServer);