"use strict";

/**
 * Includes.
 */
let https = require("https");


/**
 * Class : Face API Wrapper
 */
function FaceApiWrapper(apiKey)
{
    this.options = {};
    this.options.hostname = process.env.FACEAPI_ENDPOINT;
    this.options.port = 443;
    this.options.path = "/face/v1.0";
    this.options.headers =
    {
        "Ocp-Apim-Subscription-Key" : apiKey
    };
}


/**
 * Send a request to the Detect API.
 */
FaceApiWrapper.prototype.Detect = function(d, dataStore, cb)
{
    // Setup the request.
    this.options.path += "/detect?returnFaceId=true&returnFaceAttributes=age,gender,headPose,smile,facialHair,glasses,emotion";
    this.options.method = "POST";
    if (d.startsWith("http"))
    {
        this.options.headers["Content-Type"] = "application/json";
        d = JSON.stringify({ url : d });
    }
    else
    {
        this.options.headers["Content-Type"] = "application/octet-stream";
    }

    // Initialiez the response variables.
    if (!dataStore.faceApi) 
        dataStore.faceApi = {};
    dataStore.faceApi.detect = {};
    dataStore.faceApi.detect.datas = "";
    dataStore.faceApi.detect.res = {};

    // Send the request.
    Go(this.options, d, dataStore.faceApi.detect, cb);
}


/**
 * Send an HTTPS request to a Face API endpoint.
 */
function Go(options, datas, store, cb)
{
    let req = https.request(options, (res) =>
    {
        res.on("data", (d) =>
        {
            store.datas += d;
        });
        res.on("end", () =>
        {
            store.res = res;
            cb();
        })
    });
    req.end(datas);
}


/**
 * Module Exports.
 */
module.exports =
{
    FaceApiWrapper : FaceApiWrapper
};