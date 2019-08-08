const util = require("util");
const restify = require("restify");
const builder = require("botbuilder");
const teams = require("botbuilder-teams");

// Put your registered bot here, to register bot, go to bot framework

let appName = process.env.APPNAME;
let appId = process.env.APPID;
let appPassword = process.env.APPPASS;
let userId = 'user id';
let tenantId = process.env.TENANTID;
if(!process.env.PRODUCTION) {
  const localConfig = require('./config.json');
  appId = localConfig.appId;
  appPassword = localConfig.appPassword;
}

const connector = new teams.TeamsChatConnector({
  appId: appId,
  appPassword: appPassword
});

const inMemoryBotStorage = new builder.MemoryBotStorage();

const server = restify.createServer();
server.listen(process.env.PORT || 57106, function () {
    console.log('%s listening to %s', server.name, util.inspect(server.address()));
});

// this will receive nothing, you can put your tenant id in the list to listen
if(process.env.PRODUCTION) {
  connector.setAllowedTenants([tenantId]);
}

server.post('/api/v1/bot/messages', connector.listen());

const bot = new builder.UniversalBot(connector, (session) => {
  // Message might contain @mentions which we would like to strip off in the response
  const text = teams.TeamsMessage.getTextWithoutMentions(session.message);
  switch(text) {
    case 'help':
      session.beginDialog('help');
    break;
  }
 }).set('storage', inMemoryBotStorage);

bot.dialog('help', [
  function (session) {
      builder.Prompts.choice(session, "Choose an option:", 'Option 1|Option 2');
  },
  function (session, results) {
    switch (results.response.index) {
      case 1:
          session.endDialog('You chose option 1');
      break;
      case 2:
          session.endDialog('You chose option 1');
      break;
    }
  }
]);

// bot.on('conversationUpdate', function (message) {
//   console.log(message);
//   const event = teams.TeamsMessage.getConversationUpdateData(message);
//   session.endDialog('hello');
// });


