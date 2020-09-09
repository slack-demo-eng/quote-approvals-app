const { App } = require("@slack/bolt");
const dotenv = require("dotenv");
const axios = require("axios");
const fs = require("fs");

// import modal blocks
const {
  launch_modal,
  approval_details,
  quote_lines_details,
  deal_stats,
} = require("./blocks/modals");

// import message blocks
const {
  app_home,
  channel_exists,
  channel_created,
  discount_mention,
  channel_message,
  redirect_home,
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

/* UTILITY FUNCTIONS 🧰 */

// check if approver users exist at each level
const is_approvers_configured = (approver_users) => {
  const { l1_user, l2_user, sales_ops_user, legal_user } = approver_users;
  if (!l1_user || !l2_user || !sales_ops_user || !legal_user) {
    return false;
  }
  return true;
};

// delay wrapper function
const wait = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

// send approval in thread with 3 second delay
const sendApprovedMessage = async ({
  token,
  channel,
  ts,
  approver,
  approval_level,
  status,
  user,
}) => {
  try {
    await wait(3000);

    // post approval message
    await app.client.chat.postMessage({
      token: token,
      channel: channel,
      thread_ts: ts,
      blocks: thread_approved({ approver, approval_level }),
    });

    // update status of original message
    await app.client.chat.update({
      token: token,
      channel: channel,
      ts: ts,
      blocks: channel_message({
        user,
        companyName,
        justification,
        discount,
        status,
      }),
    });
  } catch (error) {
    console.error(error);
  }
};

/* SETTINGS ⚙️ */

// listen for app home tab opened
app.event("app_home_opened", async ({ context, event }) => {
  try {
    const approver_users = require("./settings/approver_users.json");
    await app.client.views.publish({
      token: context.botToken,
      user_id: event.user,
      view: app_home(approver_users),
    });
  } catch (error) {
    console.error(error);
  }
});

// listen for change to approvers
app.action(
  /^(l1_user|l2_user|sales_ops_user|legal_user).*/,
  async ({ ack, action }) => {
    await ack();
    try {
      const approver_users_filename = "./settings/approver_users.json";
      const approver_users = require(approver_users_filename);
      approver_users[action.action_id] = action.selected_user;
      fs.writeFile(
        approver_users_filename,
        JSON.stringify(approver_users, null, 2),
        (err) => {
          if (err) console.error(error);
        }
      );
    } catch (error) {
      console.error(error);
    }
  }
);

// acknowledge redirect to home clicked
app.action("take_me_home", async ({ ack }) => {
  await ack();
});

/* LAUNCH 🚀 */

// listen for slash command
app.command("/discount", async ({ ack, command, context }) => {
  await ack();
  try {
    const approver_users = require("./settings/approver_users.json");
    const users_configured = is_approvers_configured(approver_users);

    // send ephemeral message if approvers not configured
    if (!users_configured) {
      await app.client.chat.postEphemeral({
        token: context.botToken,
        channel: command.channel_id,
        user: command.user_id,
        blocks: redirect_home({
          workspace_id: command.team_id,
          app_id: command.api_app_id,
        }),
      });
      return;
    }

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
app.shortcut("discount_request", async ({ ack, body, context, shortcut }) => {
  await ack();
  try {
    const approver_users = require("./settings/approver_users.json");
    const users_configured = is_approvers_configured(approver_users);

    // send DM to user if approvers not configured
    if (!users_configured) {
      const {
        bot: { app_id },
      } = await app.client.bots.info({
        token: context.botToken,
        bot: context.botId,
      });

      await app.client.chat.postMessage({
        token: context.botToken,
        channel: body.user.id,
        blocks: redirect_home({
          workspace_id: body.user.team_id,
          app_id,
        }),
      });
      return;
    }

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
app.message(/discount/i, async ({ body, context, message }) => {
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
    const approver_users = require("./settings/approver_users.json");
    const users_configured = is_approvers_configured(approver_users);

    // send ephemeral message if approvers not configured
    if (!users_configured) {
      await app.client.chat.postEphemeral({
        token: context.botToken,
        channel: body.channel.id,
        user: body.user.id,
        blocks: redirect_home({
          workspace_id: body.user.team_id,
          app_id: body.api_app_id,
        }),
      });
      return;
    }

    // open modal
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
        blocks: channel_exists({ companyName, channelId: existingChannel.id }),
      });
      return;
    }

    // create channel
    const response = await app.client.conversations.create({
      token: context.botToken,
      name: `quote-approvals-${channelName.replace(/\W+/g, "-").toLowerCase()}`,
    });

    const {
      l1_user,
      l2_user,
      sales_ops_user,
      legal_user,
    } = require("./settings/approver_users.json");

    // add users to new channel
    await app.client.conversations.invite({
      token: context.botToken,
      channel: response.channel.id,
      users: `${body.user.id},${l1_user},${l2_user},${sales_ops_user},${legal_user}`,
    });

    // notify user of new channel
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: body.user.id,
      blocks: channel_created({ companyName, channelId: response.channel.id }),
    });

    // post new discount request message to new channel
    const newMessageResponse = await app.client.chat.postMessage({
      token: context.botToken,
      channel: response.channel.id,
      blocks: channel_message({
        user: body.user.username,
        companyName,
        justification,
        discount,
        status: 0,
      }),
    });

    // tag L1 approver in thread
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: newMessageResponse.channel,
      thread_ts: newMessageResponse.message.ts,
      blocks: thread_ask({
        approver: l1_user,
        approval_type: "SALES_L1",
      }),
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
      blocks: thread_error({ user: body.user.id, action: action.action_id }),
    });

    const {
      l1_user,
      l2_user,
      sales_ops_user,
      legal_user,
    } = require("./settings/approver_users.json");

    await wait(3000);

    // approve L1_SALES
    await app.client.chat.update({
      token: context.botToken,
      channel: body.channel.id,
      ts: body.message.ts,
      blocks: thread_approved({
        approver: l1_user,
        approval_level: "SALES_L1",
      }),
    });

    // update status of original message
    await app.client.chat.update({
      token: context.botToken,
      channel: body.channel.id,
      ts: body.message.thread_ts,
      blocks: channel_message({
        user: body.user.username,
        companyName,
        justification,
        discount,
        status: 1,
      }),
    });

    // L2 approval
    await sendApprovedMessage({
      token: context.botToken,
      channel: body.channel.id,
      ts: body.message.thread_ts,
      approver: l2_user,
      approval_level: "L2_SALES",
      status: 2,
      user: body.user.username,
    });

    // SALES_OPS approval
    await sendApprovedMessage({
      token: context.botToken,
      channel: body.channel.id,
      ts: body.message.thread_ts,
      approver: sales_ops_user,
      approval_level: "SALES_OPS",
      status: 3,
      user: body.user.username,
    });

    // LEGAL approval
    await sendApprovedMessage({
      token: context.botToken,
      channel: body.channel.id,
      ts: body.message.thread_ts,
      approver: legal_user,
      approval_level: "LEGAL",
      status: 4,
      user: body.user.username,
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
