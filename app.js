const { App } = require("@slack/bolt");
const dotenv = require("dotenv");
const axios = require("axios");

// import modal blocks
const {
  launch_modal,
  approval_details,
  quote_lines_details,
  deal_stats,
} = require("./blocks/modals");

// import message blocks
const {
  channel_exists,
  channel_created,
  discount_mention,
  initial_status,
  thread_ask,
  thread_error,
  thread_approved,
} = require("./blocks/messages");

// initialize env variables
dotenv.config();

// intialize app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

/* LAUNCH 🚀 */

// listen for slash command
app.command("/discount", async ({ ack, command, context }) => {
  await ack();
  try {
    // open modal
    await app.client.views.open({
      token: context.botToken,
      trigger_id: command.trigger_id,
      view: launch_modal,
    });
  } catch (error) {
    console.error(error);
  }
});

// listen for shortcut
app.shortcut("discount_request", async ({ ack, context, shortcut }) => {
  await ack();
  try {
    // open modal
    await app.client.views.open({
      token: context.botToken,
      trigger_id: shortcut.trigger_id,
      view: launch_modal,
    });
  } catch (error) {
    console.error(error);
  }
});

// listen for mentions of 'discount'
app.message(/discount/i, async ({ context, message }) => {
  try {
    // send ephemaral message
    await app.client.chat.postEphemeral({
      token: context.botToken,
      channel: message.channel,
      user: message.user,
      blocks: discount_mention,
    });
  } catch (error) {
    console.error(error);
  }
});

// listen for launch from ephemeral message
app.action("launch_discount", async ({ ack, body, context }) => {
  await ack();
  try {
    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: launch_modal,
    });
  } catch (error) {
    console.error(error);
  }
});

// listen for cancel from ephemeral message
app.action("cancel_ephemeral", async ({ ack, body }) => {
  await ack();
  try {
    // must use response_url to delete ephemeral messages
    axios
      .post(body.response_url, {
        delete_original: "true",
      })
      .catch((error) => console.error(error));
  } catch (error) {
    console.error(error);
  }
});

/* NEW CHANNEL CREATION ✨ */

let companyName, justification, discount;

// listen for modal submission
app.view("launch_modal_submit", async ({ ack, body, context, view }) => {
  try {
    // gather user input
    companyName = view.state.values.companyName.user_input.value;
    justification = view.state.values.justification.user_input.value;
    discount = view.state.values.discount.user_input.value;

    // validate discount input
    if (isNaN(discount)) {
      await ack({
        // discount input error
        response_action: "errors",
        errors: {
          discount: "Please enter a number (without a % sign)",
        },
      });
      return;
    }

    await ack();

    // format new channel name
    let channelName = companyName.replace(/\W+/g, "-").toLowerCase();
    if (channelName.slice(-1) === "-")
      channelName = channelName.substring(0, channelName.length - 1);

    // retrieve all channels
    const { channels } = await app.client.conversations.list({
      token: context.botToken,
    });

    // check if channel already exists
    const existingChannel = channels.find(
      (channel) => channel.name === `quote-approvals-${channelName}`
    );

    if (existingChannel) {
      // send DM with channel already exists message
      await app.client.chat.postMessage({
        token: context.botToken,
        channel: body.user.id,
        blocks: channel_exists(companyName, existingChannel.id),
      });
      return;
    }

    // create channel
    const response = await app.client.conversations.create({
      token: context.botToken,
      name: `quote-approvals-${channelName.replace(/\W+/g, "-").toLowerCase()}`,
    });

    // add users to new channel
    await app.client.conversations.invite({
      token: context.botToken,
      channel: response.channel.id,
      users: `${body.user.id},W0168V76LMD,W016NAJDMCM,W016NAJ2Z9B,W0168V90C6B`,
    });

    // notify user of new channel
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: body.user.id,
      blocks: channel_created(companyName, response.channel.id),
    });

    // post new discount request message to new channel
    const newMessageResponse = await app.client.chat.postMessage({
      token: context.botToken,
      channel: response.channel.id,
      link_names: true,
      blocks: initial_status(
        body.user.username,
        companyName,
        justification,
        discount
      ),
    });

    // tag L1 approver in thread
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: newMessageResponse.channel,
      thread_ts: newMessageResponse.message.ts,
      blocks: thread_ask("W0168V76LMD", "SALES_L1"),
    });
  } catch (error) {
    console.error(error);
  }
});

/* QUOTE DETAILS 📄 */

// display approval details modal
app.action("status_details", async ({ ack, context, body }) => {
  await ack();
  try {
    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: approval_details,
    });
  } catch (error) {
    console.error(error);
  }
});

// display quote lines details modal
app.action("quote_lines_details", async ({ ack, context, body }) => {
  await ack();
  try {
    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: quote_lines_details,
    });
  } catch (error) {
    console.error(error);
  }
});

// display deal stats modal
app.action("deal_stats", async ({ ack, context, body }) => {
  await ack();
  try {
    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: deal_stats,
    });
  } catch (error) {
    console.error(error);
  }
});

/* MESSAGE THREAD 🧵 */

// delay wrapper function
const wait = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

// send approval in thread with 3 second delay
const sendApprovedMessage = async (token, channel, ts, user, approval_type) => {
  await wait(3000);
  await app.client.chat.postMessage({
    token: token,
    channel: channel,
    thread_ts: ts,
    blocks: thread_approved(user, approval_type),
  });
};

// listen for 'Approve' or 'Reject' button press in thread
app.action(/^(approve|reject).*/, async ({ ack, action, context, body }) => {
  await ack();
  try {
    // inform user of authority status
    await app.client.chat.postEphemeral({
      token: context.botToken,
      user: body.user.id,
      channel: body.channel.id,
      thread_ts: body.message.thread_ts,
      blocks: thread_error(body.user.id, action.action_id),
    });

    await wait(3000);

    // approve L1_SALES
    await app.client.chat.update({
      token: context.botToken,
      channel: body.channel.id,
      ts: body.message.ts,
      blocks: thread_approved("W0168V76LMD", "SALES_L1"),
    });

    // L2 approval
    await sendApprovedMessage(
      context.botToken,
      body.channel.id,
      body.message.thread_ts,
      "W016NAJDMCM",
      "L2_SALES"
    );

    // SALES_OPS approval
    await sendApprovedMessage(
      context.botToken,
      body.channel.id,
      body.message.thread_ts,
      "W016NAJ2Z9B",
      "SALES_OPS"
    );

    // LEGAL approval
    await sendApprovedMessage(
      context.botToken,
      body.channel.id,
      body.message.thread_ts,
      "W0168V90C6B",
      "LEGAL"
    );
  } catch (error) {
    console.error(error);
  }
});

// start app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Quote Approvals Bot is running!");
})();
