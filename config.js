const fs = require("fs");

//error triggered when a field in the config file is empty
function EmptyFieldError() {
  this.name = "EMPTY_FIELD";
  this.message = "Your config file contain an empty field."
}

//error triggered when the config is not valid (missing a field, ...)
function InvalidConfig() {
  this.name = "INVALID_CONFIG";
  this.message = "Your config file is invalid (check your comments and your fields)."
}

EmptyFieldError.prototype = Error.prototype;
InvalidConfig.prototype = Error.prototype;

//function that checks the config string and throw errors if it is invalid
function check_config(config_string) {
  const valid_config_regex = /{"prefix":"[^"]+","commands":\[{"name":"[^"]+","character_field_title":"[^"]+","pinyin_field_title":"[^"]+","definition_field_title":"[^"]+","description":"[^"]+","argument":"[^"]+"},{"name":"[^"]+","pinyin_field_title":"[^"]+","character_field_title":"[^"]+","description":"[^"]+","argument":"[^"]+"},{"name":"help","description":"[^"]+"}],"error_messages":{"error_title":"[^"]+","command_error":"[^"]+","input_error":"[^"]+","perm_error":"[^"]+"}}/g

  const empty_string_regex = /""/g

  if(!valid_config_regex.test(JSON.stringify(JSON.parse(config_string)))) throw new InvalidConfig;

  if(empty_string_regex.test(config_string)) throw new EmptyFieldError;

}

//function that returns the parsed config without comments
function getConfig() {
  const comments_regex = /(?<!\\)([#]).+[^\n][^#]/g

  var config_string = fs.readFileSync("config.json", "utf-8");

  config_string = config_string.replace(comments_regex, '').replace(/\\#/g, '#');

  check_config(config_string);

  return JSON.parse(config_string);
}

module.exports.getConfig = getConfig;
