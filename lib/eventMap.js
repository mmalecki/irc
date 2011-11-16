module['exports'] = {
  "**::irc::msg"    : function (data, callback) {
    this.say(data, callback);
  },
  "**::irc::command" : function (data, callback) {
    this.command(data, callback);
  },
  "**::irc::join"    : function (data, callback) { 
    this.join(data, callback);
  },
  "**::irc::part"    : function (data, callback) {
    this.part(data, callback);
  },
  "**::irc::voice" : function (data, callback) {
    var to = data.command[2] || data.to;
    this.say({ to: to, msg: 'I declare you cool, ' + data.command[1] + '!' });
    this.command('mode ' + to + ' +v ' + data.command[1]);
  },
  "**::irc::devoice" : function (data, callback) {
    var to = data.command[2] || data.to;
    this.say({ to: to, msg: 'No more voice for you, ' + data.command[1] + '!' });
    this.command('mode ' + dest + ' -v ' + data.command[1]);
  },
  "**::irc::op" : function (data, callback) {
    var to = data.command[2] || data.to;
    this.say({ 
      to: to, 
      msg: 'Opers set, ' + data.command[1] + '!' 
    });
    this.command('mode ' + to + ' +o ' + data.command[1]);
  },
  "**::irc::deop" : function (data, callback) {
    var to = data.command[2] || data.to;
    this.say({ to: to, msg: 'No opers set, ' + data.command[1] + '!' });
    this.command('mode ' + to + ' -o ' + data.command[1]);
  },
  "**::irc::kick" : function (data, callback) {
    var to = data.command[2] || data.to;
    this.say({ to: to, msg: 'kohai says GTFO!' });
    this.command('kick ' + to + ' ' + data.command[1]);
  },
  "**::irc::ban" : function (data, callback) {
    var to = data.command[2] || data.to;
    this.say({ to: to, msg: 'BEHOLD THE MIGHT OF THE BANHAMMER!!!' });
    this.command('mode ' + to + ' +b ' + data.command[1]);
    this.command('kick ' + to + ' ' + data.command[1]);
  },
  "**::irc::unban" : function (data, callback) {
    var to = data.command[2] || data.to;
    this.say({ to: to, msg: 'Mercy has been bestowed upon ' + data.command[1]});
    this.command('mode ' + to + ' -b ' + data.command[1]);
  }
}
