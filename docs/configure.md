[⬅️ Go back to the homepage](index.html)

# Configure Kwako
Kwako supports per-server configuration. In order to configure your server, you'll firstly have to make sure that you have the `Manage Server` permission. Members with this permissions can access to ~every staff-related commands~.

The command used to configure the bot on your server is `!setconf`.
Actually, these properties are configurable:
- `prefix`, Kwako's prefix. ::(default: `!`)::
- `welcomeMessage`, message that Kwako sends in DM to every new members. ::(default: none)::
- `starboardChannel`, to designate a channel used as a Starboard. ::(default: none)::
- `muteRole`, mute role in order to use the `mute` command. ::(default: none)::
- `modLogChannel`, a channel were Kwako will send every info related to: bans, kicks, mutes & message deletions. ::(default: none)::

To use the command, do:
`!setconf (property) (value)`

For example:
`!setconf prefix ?`

**Note:** In order to set roles or channels, mention them. Make sure they are colored as the following screenshot shows, or it won't work.
![](assets/setconfrole.png)![](assets/setconfchannel.png)

**Note 2:** Respect the exact spelling and capitalization, or the bot won't understand. (That will be less strict later in future updates)