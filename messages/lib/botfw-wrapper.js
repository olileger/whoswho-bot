"use strict";

/**
 * Includes.
 */
let bb = require("botbuilder");
let bba = require("botbuilder-azure");


/**
 * Class : BotFwWrapper.
 */
function BotFwWrapper()
{
    this.devMode = (process.env.NODE_ENV == "dev");
    this.connector = this.devMode ?
                     new bb.ChatConnector() :
                     new bba.BotServiceConnector(
                     {
                         appId: process.env["MicrosoftAppId"],
                         appPassword: process.env["MicrosoftAppPassword"],
                         stateEndpoint: process.env["BotStateEndpoint"],
                         openIdMetadata: process.env["BotOpenIdMetadata"]
                     });
    this.bot = new bb.UniversalBot(this.connector);
}


/**
 * Method : Add a Dialog Handler to the bot.
 */
BotFwWrapper.prototype.AddDialogHandler = function(h)
{
    this.bot.dialog(h.path, h.waterfall);
}


/**
 * Method : Run the bot.
 */
BotFwWrapper.prototype.Run = function()
{
    this.listenner = this.connector.listen();
    if (this.devMode)
    {
        this.server = require("restify").createServer();
        this.server.post("/api/messages", this.listenner);
        this.server.listen(3978, function()
        {
            console.log("Test bot endpoint at http://localhost:3978/api/messages");
        });
    }
    return this.listenner;
}


/**
 * Module Exports.
 */
module.exports =
{
    BotFwWrapper : BotFwWrapper
};