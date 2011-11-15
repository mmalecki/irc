var Hook = require('hook.io').Hook,
    prompt = require('prompt'),
    ircModule = require('irc'),
    util = require('util');
    

var IRC = exports.IRC = function(options){

  var self = this;

  options.events = require('./eventMap');

  Hook.call(this, options);

  self.on('hook::ready', function () {
    
    self.channels = self['channels'];
    self.nick = self['nick'];
    self.ircClient = new ircModule.Client(
      self['irc-server'],
      self.nick,
      {
        port: self['port'],
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
  prompt.message = (this['promptMsg'] || 'Hook.io-IRC').red.bold;
  prompt.delimiter = (this['promptDelim'] || '>').blue.bold;
}

IRC.prototype._initIRC = function () {
  var self = this;
  self.ircClient.on('motd', function (motd) {
    self.ircClient.say('nickserv', 'identify ' + self['password']);
    self.emit('irc::connected', { channels: self.channels, ircNick: self.nick });
    if (self['idCheck']) {
      self.emit('idCheck', {check: true});
      self.ircClient.send('CAP REQ IDENTIFY-MSG');
    }
    else { self.emit('idCheck', { check: false }) }
  });
  
  self.ircClient.on('registered', function() {
    self.nick = self.ircClient.nick;
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
      self.emit('irc::gotKicked', { channel: channel, by: by, reason: reason });
    }
    else {
      self.emit('irc::userKicked', { channel: channel, nick: nick, by: by, reason: reason });
    }
  });

  self.ircClient.on('notice', function (nick, to, text) {
    if (!nick) {
      self.emit('irc::serverNotice', { to: to, text: text });
    }
  });

  self.ircClient.on('join',function (channel, nick) {
    if (nick !== self.nick) {
      self.emit('irc::joined', { channel: channel, nick: nick });
    }
  });  

  self.ircClient.on('part',function (channel, nick, reason) {
    if (nick !== self.nick) {
      self.emit('irc::parted', { channel: channel, nick: nick, reason: reason });
    }
  });  
  
  self.ircClient.on('nick', function (oldNick, newNick, channels) {
    self.emit('irc::nickChange', { oldNick: oldNick, newNick: newNick });
    if (oldNick === self.ircClient.nick) {
      self.ircClient.nick = newNick;
    }
  });
  
  self.ircClient.on('quit', function (nick, reason, channels) {
    self.emit('irc::userQuit', { nick: nick, reason: reason, channels: channels });
  });
  
  self.ircClient.on('message',function (nick, to, text) {
    prompt.pause();
    self.emit('irc::msg', { nick: nick, to: to, text: text });
    prompt.resume();
  });
  
  self.ircClient.on('selfMessage', function (to, text) {
    self.emit('irc::sentMessage', { text: text, to: to });
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

}

IRC.prototype.say = function (msg, cb) {
  var self = this;
  if(typeof msg !== 'object') {
    msg = {
      "msg": msg || 'NaNaNaNa',
      "to":  Infinity
    };
  }

  if (msg.to === Infinity) {
    self.channels.forEach( function (channel, i) {
      self.ircClient.say(channel, msg.msg);
    }) ;
  }
  else {
    self.ircClient.say(msg.to, msg.msg);  
  }
  if (typeof cb === 'function') {
    cb(null, 'Message has been sent!');
  }
}

IRC.prototype.command = function (command) {
  this.ircClient.send(command);
  this.emit('irc::command', command);
}

IRC.prototype.join = function (channel) {
  var self = this;
  self.ircClient.join(channel, function () {
    self.emit('irc::joined', {channel: channel});
    self.channels.push(channel);
  });
}

IRC.prototype.part = function (channel) {
  var self = this;
  self.ircClient.part(channel, function () {
    self.emit('irc::parted', { channel: channel });
    self.channels = self.channels.filter(function (item) {
      return item !== channel;
    });
  });
}

IRC.prototype.exit = function (message) {
  this.ircClient.disconnect(message || 'http://github.com/hookio/irc');
}