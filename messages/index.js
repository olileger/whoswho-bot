"use strict";

/**
 * Includes.
 */
const bw = require("./lib/botfw-wrapper");


/**
 * Setup & run the bot.
 */
let bot = new bw.BotFwWrapper();
bot.AddDialogHandler(require("./dialogs/whoswho-main"));
bot.AddDialogHandler(require("./dialogs/whoswho-engage"));
bot.AddDialogHandler(require("./dialogs/whoswho-picaface"));
bot.AddDialogHandler(require("./dialogs/whoswho-identify"));
module.exports.default = bot.Run();