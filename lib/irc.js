var Hook = require('hook.io').Hook,
    prompt = require('prompt'),
    ircModule = require('irc'),
    util = require('util');
    

var IRC = exports.IRC = function(options){

  Hook.call(this, options);
  var self = this;
  self.on('hook::ready', function () {
    self.channels = self['channels'];
    self.nick = self['nick'];
    self.ircClient = new ircModule.Client(
      self['irc-server'],
      self.nick,
      {
        channels: self.channels,
        showErrors: self['showErrors'],
        userName: self['userName'],
        realName: self['realName']
      }
    );

    self.ircClient.on('connect', function () {
      self._initIRC();
      self._initHook();
    });
  });
};
util.inherits(IRC, Hook);

IRC.prototype._initPrompt = function () {
  prompt.start();
  prompt.pause();
  prompt.message = this['promptMsg'].red.bold;
  prompt.delimiter = this['promptDelim'].blue.bold;
}

IRC.prototype._initIRC = function () {
  var self = this;
  self.ircClient.on('motd', function (motd) {
    self.ircClient.say('nickserv', 'identify ' + self['password']);
    self.emit('ircConnected', { channels: self.channels, ircNick: self.nick });
    if (self['useShell']) {
      self._initPrompt();
      self.shell(); 
    }
    if (self['idCheck']) {
      self.emit('idCheck', {check: true});
      self.ircClient.send('CAP REQ IDENTIFY-MSG');
    }
    else { self.emit('idCheck', { check: false }) }
  });
  
  self.ircClient.on('invite', function (channel, from) {
    self.ircClient.join(channel, function () {
      self.ircClient.say(from, 'Thanks for the invite!');
      self.emit('invited', 'I have joined ' + channel + ' at the request of ' + from + '.');
    });
  });
  
  self.ircClient.on('error',function () {
    self.emit('unknownError', arguments);
  });

  self.ircClient.on('kick', function (channel, nick, by, reason) {
    if (nick === self.nick) {
      self.emit('gotKicked', { channel: channel, by: by, reason: reason });
    }
    else {
      self.emit('userKicked', { channel: channel, nick: nick, by: by, reason: reason });
    }
  });

  self.ircClient.on('notice', function (nick, to, text) {
    if (!nick) {
      self.emit('serverNotice', { to: to, text: text });
    }
  });

  self.ircClient.on('join',function (channel, nick) {
    if (nick !== self.nick) {
      self.emit('userJoined', { channel: channel, nick: nick });
    }
  });  

  self.ircClient.on('part',function (channel, nick, reason) {
    if (nick !== self.nick) {
      self.emit('userParted', { channel: channel, nick: nick, reason: reason });
    }
  });  
  
  self.ircClient.on('nick', function (oldNick, newNick, channels) {
    self.emit('nickChange', { oldNick: oldNick, newNick: newNick });
    if (oldNick === self.ircClient.nick) {
      self.ircClient.nick = newNick;
    }
  });
  
  self.ircClient.on('quit', function (nick, reason, channels) {
    self.emit('userQuit', { nick: nick, reason: reason, channels: channels });
  });
  
  self.ircClient.on('message',function (nick, to, text) {
    prompt.pause();
    self.emit('gotMessage', { nick: nick, to: to, text: text });
    prompt.resume();
  });
  
  self.ircClient.on('selfMessage', function (to, text) {
    self.emit('sentMessage', { text: text, to: to });
  });

  self.ircClient.conn.on('end', function () {
    self.emit('hook::exit', 'Goodbye!');
    process.nextTick(function(){
      process.exit();
    });
  });
}

IRC.prototype._initHook = function () {
  var self = this;

  self.on('*::sendMsg', function (data) {
    self.say(data.dest, data.msg);
  });

  self.on('*::command', function (data) {
    self.command(data);
  });
  
  self.on('*::join', function (channel) {
    self.join(channel);
  });
  
  self.on('*::part', function (channel) {
    self.part(channel);
  });

  self.on('*::exit', function (message) {
    self.exit(message);
  });
}

IRC.prototype.say = function (dest, msg) {
  var self = this;
  if (dest === 'all') {
    self.channels.forEach( function (channel, i) {
      self.ircClient.say(channel, msg);
    }) ;
  }
  else {
    self.ircClient.say(dest, msg);  
  }
  this.emit('msgSent', 'Message has been sent!');
}

IRC.prototype.command = function (command) {
  this.ircClient.send(command);
  this.emit('commandSent', command);
}

IRC.prototype.join = function (channel) {
  var self = this;
  self.ircClient.join(channel, function () {
    self.emit('Ijoined', {channel: channel});
    self.channels.push(channel);
  });
}

IRC.prototype.part = function (channel) {
  var self = this;
  self.ircClient.part(channel, function () {
    self.emit('Iparted', {channel: channel});
    self.channels = self.channels.filter(function (item) {
      return item !== channel;
    });
  });
}

IRC.prototype.exit = function (message) {
  this.ircClient.disconnect(message || 'http://github.com/hookio/irc');
}
  
IRC.prototype.shell = function () {
  var self = this,
      properties = {
        message: self.ircClient.nick.yellow.bold,
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
        self.command(command.join(' '));
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
