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

    //missing character in command
    if(char == undefined) {
      reject(new errors.CommandError);
      return;
    }

    var embed = new Embed(4886754);

    //set the character's field in the embed with the title in the config file
    embed.addField(config.commands[0].character_field_title, char, true);

    //get character's pinyin then add a field
    await convertPinyinsAndChar(char, "char")
      .then(data => {
        let pinyins = "";

        //getting character's traditional / simplified equivalent, if there are the same, we don't add the field
        if(char == data[0].simplified && char != data[0].traditional) {

          embed.addField(config.commands[0].traditional_field_title, data[0].traditional, true);

        } else if(char != data[0].simplified && char == data[0].traditional) {

          embed.addField(config.commands[0].simplified_field_title, data[0].simplified, true);

        }

        //creating a string with each pinyin
        for(let i = 0; i < data.length; i++) {
          pinyins += `${i} : ${data[i].pinyin}\n`;
        }


        embed.addField(config.commands[0].pinyin_field_title, pinyins, true);
      })
      .catch(err => reject(err));

    //get character's definitions and add a field
    await getCharDefinition(char)
      .then(defs => embed.addField(config.commands[0].definition_field_title, defs, false))
      .catch(err => reject(err));

    //if there is only one character
    if(char.length == 1) {

      //get character's drawing and if it does not exist set the default one
      await getGifLink(char)
        .then(url => embed.setImage(url))

        .catch(err => {
          if(err.name == "GIF_ERROR") {
            embed.setImage("https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg");
          }

        });

    }


    resolve(embed.getEmbed());
  });
}

//function (command) that get pinyin's characters and return an embed
async function getCharacters(pinyin) {
  return new Promise(function(resolve, reject) {

    //missing pinyin in command
    if(pinyin == undefined) {
      reject(new errors.CommandError);
      return;
    }

    characters = ""
    embed = new Embed(4886754)
    embed.addField(config.commands[1].pinyin_field_title, pinyin, true);

    //getting pinyin's characters and add field
    convertPinyinsAndChar(pinyin, "pinyin")
      .then(data => {

        let simplified = "";
        let traditional = "";

        //creating a string with each character
        for(let i = 0; i < data.length; i++) {
          simplified += `${i} : ${data[i].simplified}\n`;
          traditional += `${i} : ${data[i].traditional}\n`;

        }

        embed.addField(config.commands[1].simplified_field_title, simplified, true);
        embed.addField(config.commands[1].traditional_field_title, traditional, true);

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
