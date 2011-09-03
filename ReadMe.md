# hook.io-irc - IRC Client hook for hook.io

Hook.io IRC is a client wrapper around [node-irc](http://github.com/martynsmith/node-irc) that provides both support for hook.io events (emitting them on IRC events and providing a Hook.io API for IRC interaction) and a basic command-line interface for direct IRC interaction.  

## Installation

     git clone git@github.com:hookio/irc.git
     cd irc
     npm install
     node bin/irc

### Using NPM

    npm install hook.io-irc
    hookio-irc

### Command-line Usage:

    hookio-irc [-s or --shell for command-line client]

The command-line client is a simple wrapper around the existing API.  Here are a few sample commands to try:

     say #channel Hi, this is my message!
     command nickserv identify leetpassword
     join #Node.js
     part #channel
     exit


## Hook Event Names

### Event Listeners

**sendMsg** *{dest, msg}* - Sends an IRC message to the provided nick/channel.

**join** *channel* - Joins the channel specified.

**part** *channel* - Parts from the provided channel, or the current channel if none is specified.

**command** *string* - Sends [string] as a raw IRC command.

**exit** - Causes the hook to disconnect from IRC and exit.

### Events Emitted:

**ircConnected** *{ircNick, channels}* - Emitted when Hook.io IRC has finished connecting to the server.

**serverNotice** *{to, text}* - Emitted when a notice is received from the IRCd.

**gotMessage** *{nick, to, text}* - Emitted when an IRC message (or pm) is received.

**Ijoined** *{channel}* - Emitted when Hook.io IRC joins a channel.

**Iparted** *{channel}* - Emitted when Hook.io IRC leaves a channel.

**userJoined** *{channel, nick}* - Emitted when a user joins a channel that Hook.io IRC is part of.

**userParted** *{channel, nick}* - Emitted when a user leaves a channel that Hook.io IRC is part of.

**nickChange** *{oldNick, newNick}* - Emitted when a user changes nicks.

**userQuit** *{nick, reason, channels}* - Emitted when a user quits.

**userKicked** *{channel, by, reason}* - Emitted when a user is kicked from a channel that Hook.io IRC is connected to.

**gotKicked** *{channel, by, reason}* - Emitted when the Hook.io IRC user is kicked from a channel.

### Hook config.json settings

```js
{
  "server": "irc.freenode.net",
  "nick": "awesomebot",
  "password": "",
  "channels": ["#nodetestsu", "#nodebombrange", "#kohai"],
  "showErrors": "true",
  "userName": "hookio",
  "realName": "Hook.io IRC Client",
  "promptMsg": "Hook.io-IRC",
  "promptDelim": ">",
  "useShell": false,
  "idCheck": true
}
```

