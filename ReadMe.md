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

## Hook Event Names

### Event Listeners

**irc::msg** *{dest, msg}* - Sends an IRC message to the provided nick/channel.

**irc::join** *channel* - Joins the channel specified.

**irc::part** *channel* - Parts from the provided channel, or the current channel if none is specified.

**irc::command** *string* - Sends [string] as a raw IRC command.

**irc::exit** - Causes the hook to disconnect from IRC and exit.

### Events Emitted:

**irc::connected** *{ircNick, channels}* - Emitted when Hook.io IRC has finished connecting to the server.

**irc::serverNotice** *{to, text}* - Emitted when a notice is received from the IRCd.

**irc::msg** *{nick, to, text}* - Emitted when an IRC message (or pm) is received.

**irc::joined** *{channel}* - Emitted when Hook.io IRC joins a channel.

**irc::parted** *{channel}* - Emitted when Hook.io IRC leaves a channel.

**irc::joined** *{channel, nick}* - Emitted when a user joins a channel that Hook.io IRC is part of.

**irc::parted** *{channel, nick}* - Emitted when a user leaves a channel that Hook.io IRC is part of.

**irc::nickChange** *{oldNick, newNick}* - Emitted when a user changes nicks.

**irc::userQuit** *{nick, reason, channels}* - Emitted when a user quits.

**irc::userKicked** *{channel, by, reason}* - Emitted when a user is kicked from a channel that Hook.io IRC is connected to.

**irc::gotKicked** *{channel, by, reason}* - Emitted when the Hook.io IRC user is kicked from a channel.

### Hook config.json settings

```js
{
  "irc-server": "irc.freenode.net",
  "nick": "awesomebot",
  "password": "",
  "channels": ["#nodetestsu", "#nodebombrange", "#kohai"],
  "showErrors": "true",
  "userName": "hookio",
  "realName": "Hook.io IRC Client",
  "idCheck": true
}
```

