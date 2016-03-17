(function() {

  var socket = io();

  socket.on('message', function(msg){
    $('#list').append('<li>' +  msg + '</li>');
  });

})();
