const { convertPinyinsAndChar, getGifLink, getCharDefinition } = require("./sql_commands");
const config = require("./config").getConfig();
const errors = require("./errors")

//Object that used to create message embeds
class Embed {
  constructor(color, image) {
    this.color = color || 0;
    this.fields = []
  }
  //function that had a field to the embed
  addField(name, value, inline) {
    this.fields.push({
      "name": name,
      "value": value,
      "inline": inline
    });
  }
  //function that change the url of the embed's image
  setImage(url) {
    this.image = url;
  }

  //function that return a usable embed
  getEmbed() {
    let embed = {"color": this.color}

    if(this.image != undefined) {
      embed["image"] = {"url": this.image};
    }

    if(this.fields.length > 0) {
      embed["fields"] = this.fields;
    }

    return embed;

  }
}

//function (command) that return an embed that contains character's pinyins, definitions and drawing
async function getInfo(char) {
  return new Promise(async function(resolve, reject) {

    var embed = new Embed(4886754);

    //set the character's field in the embed with the title in the config file
    embed.addField(config.commands[0].character_field_title, char, true);

    //get character's pinyin then add a field
    await convertPinyinsAndChar(char, "char", "pinyin")
      .then(p => embed.addField(config.commands[0].pinyin_field_title, p, true))
      .catch(err => reject(err));

    //get character's definitions and add a field
    await getCharDefinition(char)
      .then(defs => embed.addField(config.commands[0].definition_field_title, defs, false))
      .catch(err => reject(err));

    //get character's drawing and if it does not exist set the default one
    await getGifLink(char)
      .then(url => embed.setImage(url))

      .catch(err => {
        if(err.name == "GIF_ERROR") {
          embed.setImage("https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg");
        }

      });

    resolve(embed.getEmbed());
  });
}

//function (command) that get pinyin's characters and return an embed
async function getCharacters(pinyin) {
  return new Promise(function(resolve, reject) {
    characters = ""
    embed = new Embed(4886754)
    embed.addField(config.commands[1].pinyin_field_title, pinyin, true);

    //getting pinyin's characters and add field
    convertPinyinsAndChar(pinyin, "pinyin", "char")
      .then(characters => {
        embed.addField(config.commands[1].character_field_title, characters, true);

        resolve(embed.getEmbed());
      })
      .catch(err => reject(err));
  });
}

//function (command) function that get other commands usage and descriptions and return an embed
async function getHelp(arg) {
  return new Promise(function(resolve, reject) {
    var embed = new Embed(3066993);
    var usage = "";
    var description = "";

    for(let i = 0; i < config.commands.length; i++){
      let argument = "";

      //if the command need an argument (not the help function)
      if(config.commands[i].argument != undefined) {
        argument = config.commands[i].argument;
      }

      //set command's description and usage
      description = `**${config.commands[i].name}**: ${config.commands[i].description}`;
      usage = "```"+`${config.prefix} ${config.commands[i].name} ${argument}`+"```";

      //add field to embed
      embed.addField(description, usage, false);
    }

    resolve(embed.getEmbed());
  });
}

//function that get user input and execute the correct function (command) and return an embed
async function executeCommand(function_name, arg) {
  return new Promise(function(resolve, reject) {

    //commands functions
    let functions = [getInfo, getCharacters, getHelp];

    var functions_commands = {}

    //set the function key from the config value (the command name)
    for(let i = 0; i < functions.length; i++) {
      functions_commands[config.commands[i].name] = functions[i];
    }

    //if the command is not valid reject
    if(functions_commands[function_name] == undefined) {
      reject(new errors.CommandError);
    }

    //execute the command's function
    functions_commands[function_name](arg)
      .then(embed => {
        resolve(embed);
      })
      .catch(err => reject(err));

  });
}

//function that create an embed from the given error to send it to the user
function sendError(error) {
  
  var embed = new Embed(15158332);

  embed.addField(config.error_messages.error_title, error.message, false);

  return embed.getEmbed();

}

module.exports = {executeCommand, sendError};