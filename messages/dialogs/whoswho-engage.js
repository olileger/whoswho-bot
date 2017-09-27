"use strict";


/**
 * Includes.
 */
let bb = require("botbuilder");


/**
 * Invite the user to play.
 */
function Play_Ask(s, a, n)
{
    // First entry.
    if (!s.privateConversationData.engage)
    {
        s.privateConversationData.engage = {};
    }

    // Retry ?
    if (!s.privateConversationData.engage.playAgain)
    {
        bb.Prompts.confirm(s, "Would you like to play Who's who with me ?");
    }
    else
    {
        n();
    }
}


/**
 * Check the result.
 */
function Play_Ans(s, a, n)
{
    if (a.response ||
        s.privateConversationData.engage.playAgain)
    {
        s.userData.userId = s.message.user.id;
        s.send("Cooool ! Let's go then :-)");
        s.beginDialog("/whoswho-picaface");
    }
    else
    {
        s.send("Too bad, maybe next time ;-)");
        s.privateConversationData.engage = null;
        s.endDialog();
    }
}


/**
 * Ask the user to play again or no.
 */
function PlayAgain_Ask(s, a, n)
{
    bb.Prompts.confirm(s, "Would you like to play again ?");
}


/**
 * Check the answer.
 */
function PlayAgain_Ans(s, a)
{
    s.privateConversationData.engage.playAgain = false;

    if (a.response)
    {
        s.privateConversationData.engage.playAgain = true;
        s.replaceDialog("/whoswho-engage");
    }
    else
    {
        s.send("Ok no worries");
        s.privateConversationData.engage = null;
        s.endDialog();
    }
}


/**
 * Module Exports.
 */
module.exports =
{
    path : "/whoswho-engage",
    waterfall :
    [
        Play_Ask,
        Play_Ans,
        PlayAgain_Ask,
        PlayAgain_Ans
    ]
};