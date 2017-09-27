"use strict";


/**
 * Convert a Face API Detect string answer to a
 * structured object with Map.
 */
function FaceApiDetectAnswerToObject(str)
{
    let a = JSON.parse(str);
    let faces = new Map();
    let ages = new Map();
    let genders = new Map();
    let smiles = new Map();
    let facialHairs = new Map();
    let glasses = new Map();
    let emotions = new Map();
    a.forEach((e) =>
    {
        faces.set(e.faceId, e);

        // Age.
        e.faceAttributes.age = Math.round(e.faceAttributes.age);
        if (!ages.has(AgeToText(e)))
            ages.set(e.faceAttributes.age, new Map());
        ages.get(e.faceAttributes.age).set(e.faceId, e);

        // Gender.
        if (!genders.has(e.faceAttributes.gender))
            genders.set(e.faceAttributes.gender, new Map());
        genders.get(e.faceAttributes.gender).set(e.faceId, e);

        // Smiles.
        if (!smiles.has(SmileToText(e)))
            smiles.set(e.faceAttributes.smile, new Map());
        smiles.get(e.faceAttributes.smile).set(e.faceId, e);

        // Facial Hairs.
        for (let p in e.faceAttributes.facialHair)
        {
            if (!facialHairs.has(p))
                facialHairs.set(p, new Map());
            let m = facialHairs.get(p);

            if (!m.has(FacialHairToText(p, e)))
                m.set(e.faceAttributes.facialHair[p], new Map());
            m.get(e.faceAttributes.facialHair[p]).set(e.faceId, e);
        }

        // Glasses.
        if (!glasses.has(e.faceAttributes.glasses))
            glasses.set(e.faceAttributes.glasses, new Map());
        glasses.get(e.faceAttributes.glasses).set(e.faceId, e);

        // Emotions.
        for (let p in e.faceAttributes.emotion)
        {
            if (!emotions.has(p))
                emotions.set(p, new Map());
            let m = emotions.get(p);

            if (!m.has(EmotionToText(p, e)))
                m.set(e.faceAttributes.emotion[p], new Map());
            m.get(e.faceAttributes.emotion[p]).set(e.faceId, e);
        }
    });

    // Return a description.
    let desc =
    {
        faces : faces,
        ages :
        {
            question : "Are you a # ?",
            map : ages
        },
        genders :
        {
            question : "Are you a # ?",
            map : genders
        },
        smiles :
        {
            question : "Are you # smilling ?",
            map : smiles
        },
        facialHairs :
        {
            question : "Do you wear # ?",
            map : facialHairs
        },
        glasses :
        {
            question : "Do you wear # ?",
            map : glasses
        },
        emotions :
        {
            question : "Are you like # ?",
            map : emotions
        }
    };

    return desc;
}


/**
 * Convert an age value to text.
 */
function AgeToText(e)
{
    if (e.faceAttributes.age <= 3)
    {
        e.faceAttributes.age = "baby";
    }
    else if (e.faceAttributes.age > 3 &&
             e.faceAttributes.age <= 12)
    {
        e.faceAttributes.age = "child";
    }
    else if (e.faceAttributes.age > 12 &&
             e.faceAttributes.age <= 20)
    {
        e.faceAttributes.age = "teenager";
    }
    else if (e.faceAttributes.age > 20 &&
             e.faceAttributes.age <= 29)
    {
        e.faceAttributes.age = "young adult";
    }
    else if (e.faceAttributes.age >= 30 &&
             e.faceAttributes.age < 40)
    {
        e.faceAttributes.age = "thirty";
    }
    else if (e.faceAttributes.age >= 40 &&
             e.faceAttributes.age < 50)
    {
        e.faceAttributes.age = "quanrantine";
    }
    else if (e.faceAttributes.age >= 50 &&
             e.faceAttributes.age < 60)
    {
        e.faceAttributes.age = "fiftieth";
    }
    else if (e.faceAttributes.age >= 60 &&
             e.faceAttributes.age < 90)
    {
        e.faceAttributes.age = "senior";
    }
    else
    {
        e.faceAttributes.age = "very very old";
    }
}


/**
 * Convert a smile score to text.
 */
function SmileToText(e)
{
    if (e.faceAttributes.smile < 0.01)
        e.faceAttributes.smile = "not";
    else if (e.faceAttributes.smile >= 0.01 &&
             e.faceAttributes.smile < 0.75)
        e.faceAttributes.smile = "yes";
    else
        e.faceAttributes.smile = "a lot";

    return e.faceAttributes.smile;
}


/**
 * Convert a facial hair length to text.
 */
function FacialHairToText(type, e)
{
    if (e.faceAttributes.facialHair[type] < 0.5)
    {
        e.faceAttributes.facialHair[type] = "no " + type;
    }
    else
    {
        e.faceAttributes.facialHair[type] = type;
    }

    return e.faceAttributes.facialHair[type];
}


/**
 * Convert an emotion intensity to text.
 */
function EmotionToText(type, e)
{
    if (e.faceAttributes.emotion[type] < 0.01)
        e.faceAttributes.emotion[type] = "not " + type;
    else if (e.faceAttributes.emotion[type] >= 0.01 &&
             e.faceAttributes.emotion[type] < 0.3)
        e.faceAttributes.emotion[type] = "little " + type;
    else if (e.faceAttributes.emotion[type] >= 0.3 &&
             e.faceAttributes.emotion[type] <= 0.7)
        e.faceAttributes.emotion[type] = type;
    else
        e.faceAttributes.emotion[type] = "very " + type;

    return e.faceAttributes.emotion[type];
}


/**
 * Module Exports.
 */
module.exports =
{
    FaceApiDetectAnswerToObject : FaceApiDetectAnswerToObject,
    SmileToText : SmileToText,
    FacialHairToText : FacialHairToText,
    EmotionToText : EmotionToText
};