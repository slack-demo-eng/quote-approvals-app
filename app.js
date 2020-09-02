const { App } = require("@slack/bolt");
const dotenv = require("dotenv");

// import blocks
const launch_modal = require("./blocks/modals/launch");

// initialize env variables
dotenv.config();

// intialize app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// listen for slash command
app.command("/discount", async ({ ack, command, context }) => {
  await ack();
  try {
    await app.client.views.open({
      token: context.botToken,
      trigger_id: command.trigger_id,
      view: launch_modal,
    });
  } catch (error) {
    console.error(error);
  }
});

// start app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Quote Approvals Bot is running!");
})();
