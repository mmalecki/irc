#! /usr/bin/env node
var Hook = require('hook.io').Hook;

var ircModule = require('irc')    

var irc = new Hook( {
  name: 'irc'
});

irc.connect({
  port: 5000,
  host: "localhost"
});


irc.on('ready', function(){
  
  var ircClient = new ircModule.Client(
      "irc.freenode.net",
      "hookio",
      { "channels": ["#kohai", "#nodetestsu", "#nodejitsu"] }
  );

  ircClient.on("error",function() {
    console.log(arguments);
  });

  ircClient.on("message",function() {
    irc.emit('out.message', arguments)
  });
  
});
