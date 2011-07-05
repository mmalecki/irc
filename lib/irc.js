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
  self.on('ready', function () {  
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
    self.ircClient.on('connect', function () {
      console.log('connect event fired.');
      self._initIRC();
      self._initHook();
    });
  });
};
util.inherits(IRC, Hook);

IRC.prototype._initPrompt = function () {
  prompt.start();
  prompt.pause();
  prompt.message = this.promptMsg;
  prompt.delimiter = this.promptDelim;
}

IRC.prototype._initIRC = function () {
  var self = this;
  self.ircClient.on('motd', function (motd) {
    self.emit('o.ircConnect', 'Connected successfully!');
    console.log('hook.io-irc has successfully connected to IRC.');
    if (self.useShell) { 
      self._initPrompt()
      self.shell(); 
    }
  });
  
  self.ircClient.on('invite', function (channel, from) {
    self.ircClient.join(channel, function () {
      self.ircClient.say(from, 'Thanks for the invite!');
      self.emit('o.invited', 'I have joined ' + channel + ' at the request of ' + from + '.');
    });
  });
  
  self.ircClient.on('error',function () {
    self.emit('o.IRCdError', arguments);
  });

  self.ircClient.on('kick', function (channel, nick, by, reason) {
    if (nick === self.nick) {
      console.log('I have been kicked from ' + channel + ' by ' + by, reason);
      self.emit('o.gotKicked', {channel: channel, by: by, reason: reason});
    }
    else {
      console.log(nick, 'has been kicked from', channel, 'by', by, 'for', reason);
      self.emit('o.userKicked', {channel: channel, nick: nick, by: by, reason: reason});
    }
  });

  self.ircClient.on('notice', function (nick, to, text) {
    if (!nick) {
      console.log('Server Message: ', to, text);
      self.emit('o.serverNotice', {to: to, text: text});
    }
  });

  self.ircClient.on('join',function (channel, nick) {
    if (nick !== self.nick) {
      console.log(nick, ' has joined ', channel);
      self.emit('o.userJoined', {channel: channel, nick: nick});
    }
  });  

  self.ircClient.on('part',function (channel, nick, reason) {
    if (nick !== self.nick) {
      console.log(nick, ' has left ', channel, ': ', reason);
      self.emit('o.userParted', {channel: channel, nick: nick, reason: reason});
    }
  });  
  
  self.ircClient.on('nick', function (oldNick, newNick, channels) {
    console.log(oldNick + ' is now known as ' + newNick);
    self.emit('o.nickChange', {oldNick: oldNick, newNick: newNick});
  });
  
  self.ircClient.on('quit', function (nick, reason, channels) {
    console.log(nick + ' has quit: ' + reason);
    self.emit('o.userQuit', {nick: nick, reason: reason, channels: channels});
  });
  
  self.ircClient.on('message',function (nick, to, text) {
    prompt.pause();
    console.log(nick, ': ', to, ': ', text);
    self.emit('o.message', {nick: nick, to: to, text: text});
    prompt.resume();
  });
  
  self.ircClient.on('selfMessage', function (to, text) {
    console.log(self.nick, ':', to, ': ', text);
    self.emit('o.Isaid', {text: text, to: to});
  });

  self.ircClient.conn.on('end', function () {
    console.log('Goodbye!');
    process.exit();
  });
}

IRC.prototype._initHook = function () {
  var self = this;
  self.on('i.say.o.say', function (fullEvent, dest, msg) {
    self.say(dest, msg);
  });

  self.on('i.command.o.command', function (fullEvent, command) {
    self.command(command);
  });
  
  self.on('i.join.o.join', function (fullEvent, channel) {
    self.join(channel);
  });
  
  self.on('i.part.o.part', function (fullEvent, channel) {
    self.part(channel);
  });

  self.on('i.exit.o.exit', function (fullEvent, message) {
    self.exit(message);
  });
}

IRC.prototype.say = function (dest, msg) {
  this.ircClient.say(dest, msg);
  this.emit('o.msgSent', 'Message has been sent!');
}

IRC.prototype.command = function (command) {
  this.ircClient.send(command.replace('\n', '').replace('\r', ''));
  this.emit('o.commandSent');
}

IRC.prototype.join = function (channel) {
  var self = this;
  self.ircClient.join(channel, function () {
    self.emit('o.Ijoined', {channel: channel});
  });
}

IRC.prototype.part = function (channel) {
  var self = this;
  self.ircClient.part(channel, function () {
    self.emit('o.Iparted', {channel: channel});
  });
}

IRC.prototype.exit = function (message) {
  this.ircClient.disconnect(message || 'http://github.com/AvianFlu/hook.io-irc');
}
  
IRC.prototype.shell = function () {
  var self = this,
      properties = {
        message: 'connected'.green,
        name: 'command'
      };
  prompt.resume();
  prompt.get(properties, function (err, results) {
    prompt.pause();
    if (err) { return console.log(err.stack); }
    var command = results.command.split(' ');
    switch (command[0]) {
      case 'say':
        command.shift();
        self.say(command[0], command.slice(1).join(' '));
        self.shell();
        break;
      case 'join':
        command.shift();
        self.join(command[0]);
        self.shell();
        break;
      case 'part':
        command.shift();
        self.part(command[0]);
        self.shell();
        break;
      case 'command':
        command.shift();
        self.command(command[0], command.slice(1).join(' '));
        self.shell();
        break;
      case 'exit':
        self.exit(command[1] ? command.slice(1).join(' ') : '');
        break;
      default:
        console.log('Sorry, I do not understand.');
        self.shell();
        break;
    }
  });
}
