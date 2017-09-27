"use strict";

/**
 * Includes.
 */
let jimp = require("jimp");


/**
 * Class : Jimp Wrapper
 */
function JimpWrapper()
{

}


/**
 * Method : Crop a picture.
 */
JimpWrapper.prototype.Crop = function(path, top, left, width, height, cb)
{
    // First : read the file.
    jimp.read(path, (e, f) =>
    {
        if (e)
        {
            console.log("JimpWrapper Read Error : " + e);
            cb(e, null);
        }
        else
        {
            // Then : crop the file.
            f.crop(left,
                   top,
                   width,
                   height,
                   (e, f) =>
            {
                if (e)
                {
                    console.log("JimpWrapper Crop Error : " + e);
                    cb(e, null);
                }
                else
                {
                    // Finally : convert to base64.
                    f.getBase64(jimp.AUTO,
                                (e, d) =>
                    {
                        if (e)
                        {
                            console.log("JimpWrapper convert to Base64 Error : " + e);
                        }
                        cb(e, d);
                    });
                }
            });
        }
    });
}


/**
 * Module Exports.
 */
module.exports =
{
    JimpWrapper : JimpWrapper
};