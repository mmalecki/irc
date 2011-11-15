module['exports'] = {
  
  
  "**::irc::msg"     : this.say,
  "**::irc::command" : this.command,
  "**::irc::join"    : this.join,
  "**::irc::part"    : this.part,

  "**::irc::voice" : function (data, callback) {
    var to = data.command[2] || data.to;
    this.say({ to: to, msg: 'I declare you cool, ' + data.command[1] + '!' });
    this.send('mode ' + to + ' +v ' + data.command[1]);
  },

  "**::irc::devoice" : function (data, callback) {
    var to = data.command[2] || data.to;
    this.say({ to: to, msg: 'No more voice for you, ' + data.command[1] + '!' });
    this.send('mode ' + dest + ' -v ' + data.command[1]);
  },

  "**::irc::op" : function (data, callback) {
    var to = data.command[2] || data.to;
    this.say({ to: to, msg: 'Opers set, ' + data.command[1] + '!' });
    this.send('mode ' + to + ' +o ' + data.command[1]);
  },

  "**::irc::deop" : function (data, callback) {
    var to = data.command[2] || data.to;
    this.say({ to: to, msg: 'No opers set, ' + data.command[1] + '!' });
    this.send('mode ' + to + ' -o ' + data.command[1]);
  },

  "**::irc::kick" : function (data, callback) {
    var to = data.command[2] || data.to;
    this.say({ to: to, msg: 'kohai says GTFO!' });
    this.send('kick ' + to + ' ' + command[1]);
  },

  "**::irc::ban" : function (data, callback) {
    var to = data.command[2] || data.to;
    this.say({ to: to, msg: 'BEHOLD THE MIGHT OF THE BANHAMMER!!!' });
    this.send('mode ' + to + ' +b ' + data.command[1]);
    this.send('kick ' + to + ' ' + data.command[1]);
  },

  "**::irc::unban" : function (data, callback) {
    var to = data.command[2] || data.to;
    this.say({ to: to, msg: 'Mercy has been bestowed upon ' + data.command[1]});
    this.send('mode ' + to + ' -b ' + data.command[1]);
  }
  
}