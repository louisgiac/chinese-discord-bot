# Chinese Discord Bot

A discord bot that can convert pinyins to characters and vice versa, get character's traditional / simplified equivalent, definition and drawing gif.

There is also some multiple character words. Refer to [CC-CEDICT](dictionary/cedict_ts.u8) for the complete list.

## Usage
You need first to install dependencies :
```
npm install
```
To set the token environment variable :
```
BOT_TOKEN=your_token_goes_here
```
To start the bot run :
```
npm start
```
You can change messages displayed on discord by editing the [config file](config.json).

## Sources

All drawing gifs come from here :
https://github.com/nmarley/chinese-char-animations/

[character's definitions and pinyins](dictionary/cedict_ts.db) are extracted from [CC-CEDICT](dictionary/cedict_ts.u8) available here : https://www.mdbg.net/chinese/dictionary?page=cc-cedict
