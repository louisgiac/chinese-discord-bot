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

const sqlite3 = require("sqlite3").verbose();
const errors = require("./errors");

//function that send a command to a sqlite database and return the query
async function sendSQLcommand(database, command) {
    return new Promise(function(resolve, reject) {
      let db = new sqlite3.Database(database, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          reject(err);
        }
      });

      //send the command and get all the rows
      db.all(command, [], (err, rows) => {
        if(err) {
          reject(err);
        };
        resolve(rows);
      });

      db.close((err) => {
        if (err) {
          reject(err);
        }
      });

    });
}

module.exports = {

  //function that gets input's (pinyin / character) corresponding pinyin / character in the database, and return a string
  convertPinyinsAndChar: async (input, input_type, output_type) => {
    return new Promise(function(resolve, reject) {

      var characters = "";

      //send the query
      sendSQLcommand("dictionnary/pinyin-character.db", `select ${output_type} from dict where ${input_type} = "${input}";`)

        .then(data => {

          if(data.length < 1) {
            reject(new errors.InputError);
          }

          //result to string
          for(let i = 0; i < data.length; i++) {
            characters += `${i} : ${data[i][output_type]}\n`;
          }

          resolve(characters);
        })

        .catch(err => reject(err));

    });
  },

  //function that gets character's definitions in the database and return a string
  getCharDefinition : async (char) => {
    return new Promise(function(resolve, reject) {

      var definitions = "";

      //sending the query
      sendSQLcommand("dictionnary/pinyin-character.db", `select definition from dict where char = "${char}";`)

        .then(data => {
          var definition = "";

          //if there is no definition available
          if(data.length < 1) resolve("-")

          //create a string
          for(let i = 0; i < data.length; i++) {

          definition = data[i].definition.split("[SEPARATION]").join('\n')
          definitions += `${i} : ${definition}\n`;

          }

          resolve(definitions);

        })

        .catch(err => reject(err));

    });
  },

  //get drawing's gif url from chinese-char-animations github using their chars.db database
  getGifLink: async (char) => {
    return new Promise(function (resolve, reject) {

      //sending the query
      sendSQLcommand("chars.db", `select code from chinese where khar="${char}"`)

        .then(code => {

          //if there is no gif avaiable reject
          if(code.length < 1) {
            reject(new errors.GifError);
          }

          //resolve the corresponding url
          resolve(`https://raw.githubusercontent.com/nmarley/chinese-char-animations/master/images-large/${code[0].code}-large.gif`);

        })

        .catch(err => reject(err));
    });
  }
};
