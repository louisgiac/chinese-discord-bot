/*
Copyright (C) 2020  Giacinti Louis
contact : <louis@giacinti.com>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const Discord = require("discord.js");
const Cli = new Discord.Client();
const { executeCommand, sendError } = require("./embed_functions")
const config = require("./config").getConfig();
const errors = require("./errors");

require("dotenv").config();

Cli.once('ready', () => {
  console.log("Bot connected");
})

Cli.on('message', async message => {
  var embed = {};

  //if the command start with the right prefix located in the config file
  if(message.content.toLowerCase().startsWith(config.prefix+" ")) {
    var msg = message.content.split(' ');
    //msg[1] the command, msg[2] the character / pinyin given

    await executeCommand(msg[1].toLowerCase(), msg[2])
      .then(result => embed = result)
      .catch(err => embed = sendError(err));

    message.channel.send("", {embed: embed})

      .catch(err => {
        //triggered if the bot can't send the message in the channel
        if(err.code = 50013) {

          error_embed = sendError(new errors.PermissionSendError);
          message.author.send("", {embed: error_embed})
            .catch(err2 => console.error(err2));

        } else {
          console.error(err);
        }
      });

  }
});

Cli.on('shardError', error => {
	 console.error(errors.HandleError(err));
   console.error(err.name);
});

Cli.login(process.env.BOT_TOKEN)
  .catch(err => {
    //Usually triggered when the bot's token is invalid
    console.error(err.name);
    console.error(errors.HandleError(err));
  });
