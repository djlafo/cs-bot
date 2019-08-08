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
  const hasArgs = split.length > 1;
  switch(split[0]) {
    case 'jira':
      if(hasArgs) {
        session.send(getJiraLink(split[1]))
      } else {
        session.beginDialog('jira');
      }
    break;
    case 'timer': 
      if(hasArgs) {
        startTimer(session, split[1]);
      } else {
        session.beginDialog('timer');
      }
    break;
    default:
      session.beginDialog(split[0]);
    break;
  }
 }).set('storage', inMemoryBotStorage);

const options = ['randompoints', 'jira', 'timer'];
bot.dialog('help', [
  (session) => {
      builder.Prompts.choice(session, "Choose an option:", options.join('|'));
  },
  (session, results) => {
    switch (results.response.index) {
      default: 
        session.beginDialog(options[results.response.index]);
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

bot.dialog('timer', 
  (session) => {
    if(session.message.text === "3") {
      session.send("Time (hh:mm:ss, double digits and 0 digits unnecessary)?");
    } else {
      startTimer(session, session.message.text);
    }
  }
);

function getJiraLink(num) {
  return `https://jira.mediware.com/browse/MSP-${num}`;
}

function startTimer(session, time) {
  const segments = time.split(':').reverse();
  let waitTime = 0;
  if(segments.length >= 1) {
    waitTime += Number(segments[0]) * 1000;
  }
  if(segments.length >= 2) {
    waitTime += Number(segments[1]) * 60 * 1000;
  }
  if(segments.length >= 3) {
    waitTime += Number(segments[2]) * 60 * 60 * 1000;
  }
  session.send('Timer started');
  setTimeout(() => {
    session.endDialog(`Timer ended (${time})`);
  }, waitTime);
}

// bot.on('conversationUpdate', function (message) {
//   console.log(message);
//   const event = teams.TeamsMessage.getConversationUpdateData(message);
// });


