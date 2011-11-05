//
// Simple command line shell client for IRC hook
//
var prompt = require('prompt');

module['exports'] = function () {
  
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
};
