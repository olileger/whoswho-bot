"use strict";


/**
 * Includes.
 */
let bb = require("botbuilder");
let fah = require("../lib/face-api-helper");
let jw = require("../lib/jimp-wrapper");
let uuidv4 = require("uuid/v4");


/**
 * Globals
 */
let facesDesc = new Map();


/**
 * Ask a user for a yes/no related to a criteria.
 */
function Criteria_Ask(s, n)
{
    // First entry.
    if (!s.privateConversationData.identify)
    {
        // Convert the Face API Detect JSON answer to JS structured Object.
        let desc = fah.FaceApiDetectAnswerToObject(s.privateConversationData.picaface.faceApi.detect.datas);
        s.privateConversationData.picaface.faceApi.detect = {};

        // Generate a UUID for this session.
        s.privateConversationData.identify = {};
        let uuid = uuidv4();
        facesDesc.set(uuid, desc);
        s.privateConversationData.identify.uuid = uuid;
    }

    // Find the right criteria & ask the user.
    let desc = facesDesc.get(s.privateConversationData.identify.uuid);
    findCriteria(desc);
    bb.Prompts.confirm(s, desc.criteria.question);
}


/**
 * Get the answer of the user related to a criteria.
 */
function Criteria_Ans(s, a, n)
{
    // Read the answer and remove faceId not
    // concerned from facesDesc regarding the right uuid.
    let desc = facesDesc.get(s.privateConversationData.identify.uuid);

    manageFaceId(desc, desc.criteria.value, a.response == desc.criteria.expectedAnswer);

    // Still several faces to eliminate, loop !
    if (desc.faces.size > 1)
    {
        s.replaceDialog("/whoswho-identify");
    }
    else
    {
        s.send("I think I've found your face !");
        n();
    }
}


/**
 * Now there's only one face in the pipe.
 * Ask the user about it.
 */
function Face_Ask(s, a, n)
{
    // Get the face.
    let tmp = s.privateConversationData;
    let desc = facesDesc.get(tmp.identify.uuid);
    let face = desc.faces.entries().next().value[1];

    // Crop, send to the user and ask for answer.
    new jw.JimpWrapper().Crop(tmp.picaface.imageUrl,
                              face.faceRectangle.top,
                              face.faceRectangle.left,
                              face.faceRectangle.width,
                              face.faceRectangle.height,
                              (e, d) =>
    {
        let msg = new bb.Message(s);
        msg.attachments(
        [
            {
                contentType : tmp.picaface.imageType,
                contentUrl : d
            }
        ]);
        s.send(msg);
        bb.Prompts.confirm(s, "Is it this one ??");
    });
}


/**
 * Read the answer and celebrate... or cry !
 */
function Face_Ans(s, a)
{
    if (a.response)
    {
        s.send("Yippee ki-yay !");
    }
    else
    {
        s.send("Too bad :'(");
    }
    s.privateConversationData.identify = null;
    s.endDialog();
}


/**
 * Identify the best criteria to ask to the user.
 */
function findCriteria(desc)
{
    let avg = Math.round(desc.faces.size / 2);
    let criteria =
    {
        count : desc.faces.size
    };

    // age : n
    scoreCriteria(desc.ages, avg, criteria);

    // gender : male OR female
    scoreCriteria(desc.genders, avg, criteria);

    // smile : no OR yes OR a lot
    scoreCriteria(desc.smiles, avg, criteria);

    // facial hair :    moustache (not OR small OR medium OR big)
    //                  AND bread (not OR small OR medium OR big)
    //                  AND sideburns (not OR small OR medium OR big)
    scoreCriteria(desc.facialHairs, avg, criteria);

    // glasses : noGlasses OR readingGlasses OR sunglasses OR swimmingGoggles
    scoreCriteria(desc.glasses, avg, criteria);

    // emotion :    anger (not OR little OR yes OR very)
    //              AND contempt (not OR little OR yes OR very)
    //              AND disgust (not OR little OR yes OR very)
    //              AND fear (not OR little OR yes OR very)
    //              AND happiness (not OR little OR yes OR very)
    //              AND neutral (not OR little OR yes OR very)
    //              AND sadness (not OR little OR yes OR very)
    //              AND surprise (not OR little OR yes OR very)
    scoreCriteria(desc.emotions, avg, criteria);

    desc.criteria = criteria;
}


/**
 * For a criteria, identify if it's the best to ask.
 */
function scoreCriteria(desc, avg, criteria)
{
    desc.map.forEach((v, k, m) =>
    {
        if (v.size == 0)
        {
            return;
        }

        let e = v.entries().next().value;
        if (e[1].constructor == Map)
        {
            let d =
            {
                question : desc.question,
                map : v
            };
            scoreCriteria(d, avg, criteria);
            return;
        }

        let score = Math.max(v.size, avg) - Math.min(v.size, avg);
        if (score < criteria.count)
        {
            // Reverse the question & expected answer if no/not criteria
            let str = String(k);
            if (str.startsWith("no "))
            {
                str = str.replace("no ", "");
                criteria.expectedAnswer = false;
            }
            else if (str.startsWith("not "))
            {
                str = str.replace("not ", "");
                criteria.expectedAnswer = false;
            }
            else
            {
                criteria.expectedAnswer = true;
            }
            criteria.question = desc.question.replace("#", str);
            criteria.value = v;
            criteria.count = score;
        }
    });
}


/**
 * Keep or remove facesId from the descriptor
 * according to the user's choice.
 */
function manageFaceId(desc, faceIds, keep)
{
    desc.faces.forEach((v, k, m) =>
    {
        if ((faceIds.has(k) && !keep) ||
            (!faceIds.has(k) && keep))
        {
            m.delete(k);
            removeFromMap(desc.ages.map, k);
            removeFromMap(desc.genders.map, k);
            removeFromMap(desc.smiles.map, k);
            desc.facialHairs.map.forEach((v2, k2, m2) =>
            {
                removeFromMap(v2, k);
            });
            removeFromMap(desc.glasses.map, k);
            desc.emotions.map.forEach((v2, k2, m2) =>
            {
                removeFromMap(v2, k);
            });
        }
    });
}


/**
 * Remove a key from a map that contains
 * submap.
 */
function removeFromMap(map, key)
{
    map.forEach((v, k, m) =>
    {
        if (v.has(key))
        {
            v.delete(key);
        }
    });
}


/**
 * Module Exports.
 */
module.exports =
{
    path : "/whoswho-identify",
    waterfall :
    [
        Criteria_Ask,
        Criteria_Ans,
        Face_Ask,
        Face_Ans
    ]
};