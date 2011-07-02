var Hook = require('hook.io').Hook,
    prompt = require('prompt'),
    ircModule = require('irc'),
    util = require('util');
    

var IRC = exports.IRC = function(options){
  for (var o in options) {
    this[o] = options[o];
  }
  Hook.call(this);
  var self = this;
  prompt.start();
  prompt.pause();
  self.on('ready', function(){
    
    self.ircClient = new ircModule.Client(
      self.server,
      self.nick,
      {
        channels: self.channels,
        showErrors: self.showErrors,
        userName: self.userName,
        realName: self.realName
      }
    );
    
    self.ircClient.on('motd', function (motd) {
      self.emit('o.ircConnect', 'Connected successfully!');
      console.log('hook.io-irc has successfully connected to IRC.');
      //console.log(self.userName, self.realName);
      if (self.shell) { shell(); }
    });
    
    self.ircClient.on('invite', function (channel, from) {
      self.ircClient.join(channel, function () {
        self.ircClient.say(from, 'Thanks for the invite!');
        self.emit('o.invited', 'I have joined ' + channel + ' at the request of ' + from + '.');
      });
    });
    
    self.ircClient.on('error',function () {
      console.log(arguments);
      self.emit('o.IRCdError', arguments);
    });
  
    self.ircClient.on('join',function (channel, nick) {
      if (nick !== self.nick) {
        console.log(nick, ' has joined ', channel);
        self.emit('o.userJoined', channel, nick);
      }
    });  
  
    self.ircClient.on('part',function (channel, nick, reason) {
      if (nick !== self.nick) {
        console.log(nick, ' has left ', channel, ': ', reason);
        self.emit('o.userParted', channel, nick, reason);
      }
    });  
    
    self.ircClient.on('nick', function (oldNick, newNick, channels) {
      console.log(oldNick + ' is now known as ' + newNick);
      self.emit('o.nickChange', oldNick, newNick);
    });
    
    self.ircClient.on('quit', function (nick, reason, channels) {
      console.log(nick + ' has quit: ' + reason);
      self.emit('o.userQuit', nick, reason);
    });
    
    self.ircClient.on('message',function (nick, to, text) {
      console.log(nick, ': ', to, ': ', text);
      self.emit('o.message', nick, to, text);
    });
    
    self.ircClient.on('selfMessage', function (to, text) {
      console.log(self.nick, ':', to, ': ', text);
      self.emit('o.Isaid', text, to);
    })

    self.on('i.say.o.say', function (fullEvent, dest, msg) {
      self.ircClient.say(dest, msg);
      self.emit('o.msgSent', 'Message has been sent!');
    });

    self.on('i.command.o.command', function (fullEvent, command) {
      self.ircClient.send(command.join(' '));
      self.emit('o.commandSent');
    });
    
    self.on('i.join.o.join', function (fullEvent, channel) {
      self.ircClient.join(channel, function () {
        self.emit('o.Ijoined', channel);
      });
    });
    
    self.on('i.part.o.part', function (fullEvent, channel, reason) {
      self.ircClient.part(channel, function () {
        self.emit('o.Iparted', channel);
      });
    });

    self.on('i.exit.o.exit', function (fullEvent, message) {
      console.log('Goodbye!');
      self.ircClient.disconnect(message || 'http://github.com/AvianFlu/hook.io-irc');
      process.exit();
    })
    
    function shell() {
      var properties = {
            message: 'Hook.io-IRC>',
            name: 'command'
          },
          msg;
      prompt.resume();
      prompt.get(properties, function (err, results) {
        prompt.pause();
        if (err) { return console.log(err.stack); }
        var command = results.command.split(' ');
        switch (command[0]) {
          case 'say':
            command.shift();
            msg = command.slice(1).join(' ');
            self.ircClient.say(command[0], msg);
            //self.emit('o.said', msg);
            shell();
            break;
          case 'join':
            command.shift();
            self.ircClient.join(command[0], function () {
              console.log('Joined: ', command[0]);
              self.emit('o.Ijoined', command[0]);
            });
            shell();
            break;
          case 'part':
            command.shift();
            self.ircClient.part(command[0], function () {
              console.log('Left: ', command[0]);
              self.emit('o.Iparted', command[0]);
            });
            shell();
            break;
          case 'command':
            command.shift();
            self.ircClient.send(command[0], command.slice(1).join(' '));
            self.emit('o.commandSent');
            shell();
            break;
          case 'exit':
            console.log('Goodbye!');
            self.ircClient.disconnect('http://github.com/AvianFlu/hook.io-irc');
            process.exit();
            break;
          default:
            console.log('Sorry, I do not understand.');
            shell();
            break;
        }
      });
    }
  });
};
util.inherits(IRC, Hook);

