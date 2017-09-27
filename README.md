# whoswho-bot
A "Who's who" gaming bot that use Microsoft Bot Framework as well as Cognitive Services

## How To Use ?
- Create an instance of Azure Cognitive Services - Face API and get the key
- `git clone` this repository then move on
- `npm install` & `npm install --dev` to install the related NPM packages
- To run the bot Windows :
  1) `SET NODE_ENV=dev`
  2) `SET FACEAPI_KEY=your-key`
  3) `node messages\index.js`
- To run the bot on Linux : `NODE_ENV=dev FACEAPI_KEY=your-key node messages\index.js`
- ... but the better is to run the bot on Azure Bot Service :-) : <https://azure.microsoft.com/en-us/services/bot-service/>

## How It Is Designed ?
- About Microsoft Bot Framework : <https://dev.botframework.com/>
- About Microsoft Cognitive Services - Face API : <https://docs.microsoft.com/fr-fr/azure/cognitive-services/face/apireference>
- `images` contains images sample
- `messages` contains the bot code
  * `index.js` is the entry point
  * `lib` contains my own library like helper & wrapper to either easily use Bot Framework & Azure Cognitive Services
  * `dialogs` contains the different bot dialogs
- `PostDeployScripts` is specific to Azure Bot Service deployment
- `host.json` is also specific to Azure Bot Service deployment