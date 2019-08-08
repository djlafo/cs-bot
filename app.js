const util = require("util");
const restify = require("restify");
const builder = require("botbuilder");
const teams = require("botbuilder-teams");

// Put your registered bot here, to register bot, go to bot framework
const appName = process.env.APPNAME;
const appId = process.env.APPID;
const appPassword = process.env.APPPASS;
const userId = 'user id';
const tenantId = process.env.TENANTID;

const connector = new teams.TeamsChatConnector({
  appId: appId,
  appPassword: appPassword
});

const inMemoryBotStorage = new builder.MemoryBotStorage();

const server = restify.createServer();
server.listen(process.env.PORT, function () {
    console.log('%s listening to %s', server.name, util.inspect(server.address()));
});

// this will receive nothing, you can put your tenant id in the list to listen
// connector.setAllowedTenants([]);
// this will reset and allow to receive from any tenants
connector.resetAllowedTenants();

server.post('/api/v1/bot/messages', connector.listen());

const bot = new builder.UniversalBot(connector, (session) => {
  // Message might contain @mentions which we would like to strip off in the response
  const text = teams.TeamsMessage.getTextWithoutMentions(session.message);
  session.send('You said: %s', text);
}).set('storage', inMemoryBotStorage);

// bot.dialog('/', [
//   function (session) {
//       builder.Prompts.choice(session, "Choose an option:", 'Fetch channel list|Mention user|Start new 1 on 1 chat|Route message to general channel|FetchMemberList|Send O365 actionable connector card|FetchTeamInfo(at Bot in team)|Start New Reply Chain (in channel)|Issue a Signin card to sign in a Facebook app|Logout Facebook app and clear cached credentials|MentionChannel|MentionTeam|NotificationFeed|Bot Delete Message');
//   },
//   function (session, results) {
//     switch (results.response.index) {
//     }
//   }
// ]);

// bot.on('conversationUpdate', function (message) {
//   console.log(message);
//   const event = teams.TeamsMessage.getConversationUpdateData(message);
//   session.endDialog('hello');
// });


