"use strict";


/**
 * Includes.
 */
let bb = require("botbuilder");
let faw = require("../lib/face-api-wrapper");


/**
 * Ask the user to upload a picture.
 */
function UploadPicture_Ask(s, a, n)
{
    // First entry.
    if (!s.privateConversationData.picaface)
    {
        s.privateConversationData.picaface = {};
    }

    // Retry upload ?
    let str = "";
    if (!s.privateConversationData.picaface.retryUpload)
    {
        str = "First, please upload a picture";
    }
    else
    {
        str = "Awaiting your file..";
    }
    s.privateConversationData.picaface.retryUpload = false;
    bb.Prompts.attachment(s, str);
}


/**
 * Check the upload information.
 */
function UploadPicture_Ans(s, a, n)
{
    s.send("Fine. Now please wait while I'm getting your file.. :-)");

    // Is file present ?
    if (a.response.length == 0)
    {
        s.send("Sorry but this is NOT the kind of file I expect, try again");
        s.privateConversationData.picaface.retryUpload = true;
        s.replaceDialog("/whoswho-picaface");
        return;
    }

    // Is Content-type image ?
    let img = a.response[0];
    if (!img.contentType.startsWith("image/"))
    {
        s.send("Sorry but this is not a picture, try again");
        s.privateConversationData.picaface.retryUpload = true;
        s.replaceDialog("/whoswho-picaface");
        return;
    }
    s.privateConversationData.picaface.imageType = img.contentType;

    // Start analysis.
    s.privateConversationData.picaface.imageUrl = img.contentUrl;
    n();
}


/**
 * Sends the request to Face API.
 */
function AnalyzeFaces_Send(s, a, n)
{
    s.send("Got it, now let me check your file...");
    new faw.FaceApiWrapper(process.env.FACEAPI_KEY).Detect(s.privateConversationData.picaface.imageUrl,
                                                           s.privateConversationData.picaface,
                                                           n);
    s.sendTyping();
}


/**
 * Manage the results of Face API.
 */
function AnalyzeFaces_Recv(s, a, n)
{
    // Check the content.
    let r = s.privateConversationData.picaface.faceApi.detect;
    if (r.res.statusCode != 200)
    {
        s.send(":-( Something went wrong when analyzing so please try again");
        s.privateConversationData.picaface.faceApi.detect = null;
        s.privateConversationData.picaface.retryUpload = true;
        s.replaceDialog("/whoswho-picaface");
        return;
    }
    let len = JSON.parse(r.datas).length;
    if (len == 0)
    {
        s.send("No face at all, please upload another picture");
        s.privateConversationData.picaface.faceApi.detect = null;
        s.privateConversationData.picaface.retryUpload = true;
        s.replaceDialog("/whoswho-picaface");
        return;
    }
    if (len == 1)
    {
        s.send("There's only 1 face, too easy ;-) try with another image");
        s.privateConversationData.picaface.faceApi.detect = null;
        s.privateConversationData.picaface.retryUpload = true;
        s.replaceDialog("/whoswho-picaface");
        return;
    }

    // Everything goes fine ask the user to pic a face.
    r.res = "";
    s.send("Everything goes fine !!");
    n();
}


/**
 * Ask the user to pic a face.
 */
function PicAFace_Ask(s, a, n)
{
    s.send("Please pic a face and let me know when you're done...");
    setTimeout(() =>
    {
        bb.Prompts.confirm(s, "Are you ready ?");
    },
    4000);
}


/**
 * Check the answer.
 */
function PicAFace_Ans(s, a)
{
    if (a.response)
    {
        s.beginDialog("/whoswho-identify");
    }
    else
    {
        s.privateConversationData.picaface = null;
        s.endDialog();
    }
}


/**
 * Module Exports.
 */
module.exports =
{
    path : "/whoswho-picaface",
    waterfall :
    [
        UploadPicture_Ask,
        UploadPicture_Ans,
        AnalyzeFaces_Send,
        AnalyzeFaces_Recv,
        PicAFace_Ask,
        PicAFace_Ans
    ]
};