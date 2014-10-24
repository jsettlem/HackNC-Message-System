var app = require('express')();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MailChimpAPI = require('mailchimp').MailChimpAPI;
var secret = require('./secret.json');
var apiKey = secret.key;

var messageArchive = []

try { 
    var api = new MailChimpAPI(apiKey, { version : '2.0' });
} catch (error) {
    console.log(error.message);
}

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

app.get('/jquery.textfill.min.js', function(req, res){
  res.sendFile(path.join(__dirname, './', 'jquery.textfill.min.js'));
});

//socket.io stuff
io.on('connection', function(socket){
  socket.on('message', function(msg){
	console.log(msg);
	if (msg.pass===secret.pass) {
		io.emit("message", msg.msg);
		try {
			if (msg.email) {
				api.call('campaigns', 'create', {type:"plaintext", options:{list_id:secret.list, subject:msg.subject, from_email:"contact@hacknc.us", from_name: "HackNC", to_name:"*|NAME|*"}, content:{text:msg.body}}, function (error, data) {
					if (error) {
						console.log(error.message);
						console.log("error!")
					} else {
						console.log(JSON.stringify(data));
						api.call('campaigns', 'send', {cid: data.id}, function (error, data) {});
					}
				});
			}
		} catch (e) {
			socket.emit("message", {'error':e});
		}
		msg.pass="";
		messageArchive.push(msg);
	} else {
		console.log("wow");
		socket.emit("message", {'error':"invalid password"});
	};
	
  });
});

//archive
app.get('/archive', function(req, res) {
	res.send(JSON.stringify(messageArchive, null, '\t').split("\n").join("<br>"));
});

http.listen(9001, function(){
  console.log('listening on *:9001');
});