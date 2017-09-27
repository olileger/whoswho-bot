"use strict";


/**
 * Includes.
 */
let bb = require("botbuilder");


/**
 * Welcome the user.
 */
function Hello(s)
{
    s.send("Hello and welcome to Who's who !");
    s.beginDialog("/whoswho-engage");
}


/**
 * Close the dialog.
 */
function Bye(s, a)
{
    s.send("See ya ! :-)");
    s.endDialog();
}


/**
 * Module Exports.
 */
module.exports =
{
    path : "/",
    waterfall :
    [
        Hello,
        Bye
    ]
};