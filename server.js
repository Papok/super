//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');
var fs = require('fs');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var list = [
  {
    messages: [],
    sockets: []
  }];


function remoteLog(logString) {
  broadcast('remoteLog', logString);
}

io.on('connection', function (socket) {
    list[0].messages.forEach(function (data) {
      
      socket.emit('message', data);
    });

    list[0].sockets.push(socket);

    socket.on('disconnect', function () {
      list[0].sockets.splice(list[0].sockets.indexOf(socket), 1);
      updateRoster();
    });
    
    socket.on('saveFile', function() {
      remoteLog('saveFile evente recived');
      fs.writeFileSync('test.json', JSON.stringify(list[0].messages), 'utf8');
    });
    
    socket.on('loadFile', function() {
      remoteLog('loadFile event recived');
      fs.readFile('test.json', 'utf8', function(err, data) {
        if (err) {
          remoteLog(err);
        }
      list[0].messages = JSON.parse(data);
      broadcast('loadFile', list[0].messages);      
      });
 
    });
    
    socket.on('deleteFile', function() {
      remoteLog('deleteFile event recived');
    });
    
    socket.on('deleteData', function() {
      remoteLog('deleteData event recived');
      list[0].messages = [];
      broadcast('deleteData');
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text,
          checked: false
        };
        broadcast('message', data);
        list[0].messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
    
    socket.on('changeCheckBox', function (idx) {
//    remoteLog("got changeCheckBox from: " + idx + " that was: " + messages[idx].checked);
      list[0].messages[idx].checked = !list[0].messages[idx].checked;
      var data = {
        idx: idx,
        checked: list[0].messages[idx].checked
      }
//    remoteLog('broadcasting: ' + JSON.stringify(data));
      broadcast('changeCheckBox', data);
        
    });
  });

function updateRoster() {
  async.map(
    list[0].sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  list[0].sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

remoteLog('Starting...');



server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
