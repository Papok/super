function ChatController($scope) {
  var socket = io.connect();

  $scope.messages = [];
  $scope.roster = [];
  $scope.name = '';
  $scope.text = '';
  $scope.list = '';

  socket.on('remoteLog', function(logString) {
    console.log('Server says: ' + logString);
  });

  socket.on('connect', function() {
    $scope.setName();
  });

  socket.on('message', function(msg) {
    //        console.log('Message object recived: ' + JSON.stringify(msg));
    $scope.messages.push(msg);
    $scope.$apply();
  });

  socket.on('roster', function(names) {
    $scope.roster = names;
    $scope.$apply();
  });

  socket.on('changeCheckBox', function(data) {
    //        console.log('Checked status recived:' + data.checked + " for " + data.idx)
    $scope.messages[data.idx].checked = data.checked;
    $scope.$apply();
  });

  socket.on('deleteData', function() {
    $scope.messages = [];
    $scope.$apply();
    console.log('Data deleted.');
  });

  socket.on('loadFile', function(messages) {
    $scope.messages = messages;
    $scope.$apply();
    console.log('Data loaded');
  });


  $scope.send = function send() {
    //      console.log('Sending message:', $scope.text);
    socket.emit('message', $scope.text);
    $scope.text = '';
  };
  $scope.changeCheckBox = function changeCheckBox(idx) {
    //        console.log('Sending message:'+ idx + " | current status: " + $scope.messages[idx].checked);
    socket.emit('changeCheckBox', idx);
  };

  $scope.setName = function setName() {
    socket.emit('identify', $scope.name);
  };

  $scope.sendEvent = function sendEvent(eventType) {
    socket.emit(eventType);
    console.log(eventType + " event sent");
  };
}
