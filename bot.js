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
