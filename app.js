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
server.listen(process.env.PORT || 57106, () => {
    console.log('%s listening to %s', server.name, util.inspect(server.address()));
});

// this will receive nothing, you can put your tenant id in the list to listen
if(process.env.PRODUCTION) {
  connector.setAllowedTenants([tenantId]);
}

server.post('/api/v1/bot/messages', connector.listen());

/* VARIABLES */
/* END VARIABLES */

const bot = new builder.UniversalBot(connector, (session) => {
  // Message might contain @mentions which we would like to strip off in the response
  const text = teams.TeamsMessage.getTextWithoutMentions(session.message);
  const split = session.message.text.split(' ');
  switch(split[0]) {
    case 'help':
      session.beginDialog('help');
    break;
    case 'randompoints':
      session.beginDialog('randompoints');
    break;
    case 'jira':
      if(split.length > 1) {
        session.send(getJiraLink(split[1]))
      } else {
        session.beginDialog('jira');
      }
    break;
  }
 }).set('storage', inMemoryBotStorage);

bot.dialog('help', [
  (session) => {
      builder.Prompts.choice(session, "Choose an option:", 'Random Points|Jira');
  },
  (session, results) => {
    switch (results.response.index) {
      case 0:
        session.beginDialog('points');
      break;
      case 1:
        session.beginDialog('jira');
      break;
    }
  }
]);

bot.dialog('randompoints',
  (session) => {
    const points = [0,1,2,3,5,8,13,21];
    session.endDialog(`${points[Math.floor(Math.random() * points.length)]} points`);
  }
);

bot.dialog('jira',
  (session) => {
    if(session.message.text === "2") {
      session.send("Number?");
    } else {
      session.send(getJiraLink(session.message.text));
    }
  }
);

function getJiraLink(num) {
  return `https://jira.mediware.com/browse/MSP-${num}`;
}

// bot.on('conversationUpdate', function (message) {
//   console.log(message);
//   const event = teams.TeamsMessage.getConversationUpdateData(message);
// });


