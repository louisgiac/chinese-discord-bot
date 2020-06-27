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

const CHAR_DB = "chars.db";
const CEDICT_DB = "dictionary/cedict_ts.db";

//function that send a command to a sqlite database and return the query
async function sendSQLcommand(database, command) {
    return new Promise(function(resolve, reject) {
      let db = new sqlite3.Database(database, sqlite3.OPEN_READ, (err) => {
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

  //function that gets input's (pinyin / character) corresponding pinyin / character in the database, and return an object
  convertPinyinsAndChar: async (input, input_type) => {
    return new Promise(function(resolve, reject) {

      var output_type = "simplified, traditional";
      var condition = `pinyin = "${input}"`;

      if(input_type == "char") {
        output_type = "pinyin";
        condition = `simplified = "${input}" or traditional = "${input}"`;
      }

      //send the query
      sendSQLcommand(CEDICT_DB, `select simplified, traditional, pinyin from dict where ${condition};`)

        .then(data => {

          if(data.length < 1) {
            reject(new errors.InputError);
          }

          resolve(data);

        })

        .catch(err => reject(err));

    });
  },

  //function that gets character's definitions in the database and return a string
  getCharDefinition : async (char) => {
    return new Promise(function(resolve, reject) {

      var definitions = "";

      //sending the query
      sendSQLcommand(CEDICT_DB, `select definition from dict where simplified = "${char}" or traditional = "${char}";`)

        .then(data => {
          var definition = "";

          //create a string
          for(let i = 0; i < data.length; i++) {

          definitions += `${i} : ${data[i].definition}\n`;

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
      sendSQLcommand(CHAR_DB, `select code from chinese where khar="${char}"`)

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
