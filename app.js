const { App } = require("@slack/bolt");
const dotenv = require("dotenv");

// initialize env variables
dotenv.config();

// intialize app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// listen for slash command
app.command("/discount", async ({ ack }) => {
  await ack();
  console.log("here");
});

(async () => {
  // start app
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Quote Approvals Bot is running!");
})();
