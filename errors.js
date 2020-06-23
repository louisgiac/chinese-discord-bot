const config = require("./config").getConfig();

//triggered when the sent command is invalid
function CommandError() {
  this.name = "COMMAND_ERROR";
  this.message = config.error_messages[this.name.toLowerCase()];
}

//triggered when the character / pinyin input is invalid
function InputError() {
  this.name = "INPUT_ERROR";
  this.message = config.error_messages[this.name.toLowerCase()];
}

//triggered when no gif is found for the selected character
function GifError() {
  this.name = "GIF_ERROR";
  this.message = config.error_messages[this.name.toLowerCase()];
}

//triggered when the bot is not able to send a message in the channel
function PermissionSendError() {
  this.name = "PERM_ERROR";
  this.message = config.error_messages[this.name.toLowerCase()];
}

//function that handle invalid token errors, connection errors, ...
function HandleError(err) {
  var error_message = "";
  switch(err.name) {
    case "TOKEN_INVALID":
      error_message = "Your discord bot's token is invalid, are you sure you have set it in the environment variable BOT_TOKEN ?";
      break;

    //connection error
    case "ECONNRESET":
    case "ETIMEDOUT":
    case "EPIPE":
    case "ENOTFOUND":
    case "ECONNREFUSED":
      error_message = "A connection error occured, check your internet connection.";
      break;
    default:
      error_message = err.message;
  }

  return error_message;
}

InputError.prototype = Error.prototype;
GifError.prototype = Error.prototype;
CommandError.prototype = Error.prototype;
PermissionSendError.prototype = Error.prototype;

module.exports = {InputError, GifError, CommandError, HandleError, PermissionSendError};
