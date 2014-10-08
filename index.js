var app = require('express')();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

//files and stuff
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, './', 'index.html'));
});

app.get('/secret', function(req, res){
  res.sendFile(path.join(__dirname, './', 'secret.html'));
});

app.get('/mespeak.js', function(req, res){
  res.sendFile(path.join(__dirname, './mespeak', 'mespeak.js'));
});

app.get('/mespeak_config.json', function(req, res){
  res.sendFile(path.join(__dirname, './mespeak', 'mespeak_config.json'));
});

app.get('/en-us.json', function(req, res){
  res.sendFile(path.join(__dirname, './mespeak/voices/en', 'en-us.json'));
});

app.get('/s.ogg', function(req, res){
  res.sendFile(path.join(__dirname, './', 's.ogg'));
});

//socket.io stuff
io.on('connection', function(socket){
  socket.on('message', function(msg){
    io.emit("message", msg);
  });
});

http.listen(9001, function(){
  console.log('listening on *:9001');
});