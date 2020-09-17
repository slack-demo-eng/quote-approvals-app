const { App } = require("@slack/bolt");
const dotenv = require("dotenv");
const axios = require("axios");
const fs = require("fs");

// import consts
const { new_user } = require("./consts/new_user");

// import modal blocks
const modals = require("./blocks/modals");
const {
  launch_modal,
  approver_details,
  quote_line_details,
  deal_stats,
} = modals;

// import message blocks
const {
  app_home,
  channel_exists,
  channel_created,
  discount_approved,
  discount_mention,
  channel_message,
  redirect_home,
  thread_approved,
  thread_ask,
  thread_error,
} = require("./blocks/messages");
const { brotliCompressSync } = require("zlib");

// initialize env variables
dotenv.config();

// intialize app
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: "apples-fans-boats",
  scopes: [
    "channels:history",
    "channels:manage",
    "chat:write",
    "chat:write.public",
    "commands",
    "users:read",
    "channels:read",
    "links:read",
  ],
  installerOptions: {
    userScopes: ["channels:history"],
  },
  installationStore: {
    storeInstallation: async (installation) => {
      return storeInstallationInDb(installation);
    },
    fetchInstallation: async (InstallQuery) => {
      const installation = fetchInstallationFromDb(InstallQuery);
      return installation;
    },
  },
});

/* UTILITY FUNCTIONS 🧰 */

// store installation in database
const storeInstallationInDb = (installation) => {
  const installationsObj = require("./settings/installations.json");

  const installIndex = installationsObj.installations
    .map((inst) => inst.team.id)
    .indexOf(installation.team.id);

  // update existing installation if exists
  if (~installIndex) {
    installationsObj.installations[installIndex] = installation;
  } else {
    installationsObj.installations.push(installation);
  }

  fs.writeFile(
    "./settings/installations.json",
    JSON.stringify(installationsObj, null, 2),
    (err) => {
      if (err) console.error(error);
    }
  );
};

// fetch installation from database
const fetchInstallationFromDb = (installQuery) => {
  const { installations } = require("./settings/installations.json");
  const installation = installations.find((installation) => {
    return installation.enterprise.id === installQuery.enterpriseId;
  });
  return installation;
};

// check if approver users exist at each level
const is_approvers_configured = (approver_users) => {
  if (!approver_users) return false;
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
  user_settings_obj,
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
        user_settings_obj,
      }),
    });
  } catch (error) {
    console.error(error);
  }
};

/* SETTINGS ⚙️ */

// listen for app home tab opened
app.event("app_home_opened", async ({ body, context }) => {
  try {
    const { user_settings } = require("./settings/user_settings.json");

    // check if approver users exist for user in workspace
    const index = user_settings.findIndex((item) => {
      return item.user_id === body.event.user && item.team_id === body.team_id;
    });

    if (index === -1) {
      user_settings.push(new_user(body.event.user, body.team_id));

      // save new user settings
      fs.writeFile(
        "./settings/user_settings.json",
        JSON.stringify({ user_settings }, null, 2),
        (err) => {
          if (err) console.error(error);
        }
      );
    }

    // load app home
    await app.client.views.publish({
      token: context.botToken,
      user_id: body.event.user,
      view: app_home,
    });
  } catch (error) {
    console.error(error);
  }
});

// listen for edit button click
app.action(
  /^(edit_approvers|edit_proposed_structure|edit_quote_lines|edit_approver_details|edit_quote_line_details|edit_deal_stats).*/,
  async ({ ack, action, body, context }) => {
    await ack();
    try {
      const { user_settings } = require("./settings/user_settings.json");
      const user_settings_obj = user_settings.find((item) => {
        return item.user_id === body.user.id && item.team_id === body.team.id;
      });

      // push values to edit modal
      await app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: modals[action.action_id](user_settings_obj),
      });
    } catch (error) {
      console.error(error);
    }
  }
);

// listen for save of new approver users
app.view(
  /^(save_approver_users|save_proposed_structure|save_quote_lines|save_approver_details|save_quote_line_details|save_deal_stats).*/,
  async ({ ack, body, view }) => {
    await ack();
    try {
      const { user_settings } = require("./settings/user_settings.json");
      const index = user_settings.findIndex(
        (item) => item.user_id === body.user.id && item.team_id === body.team.id
      );

      const payload = view.state.values;

      // save new approver users info
      if (view.callback_id === "save_approver_users") {
        user_settings[index].approver_users = {
          l1_user: payload.l1_user_block.l1_user.selected_user,
          l2_user: payload.l2_user_block.l2_user.selected_user,
          sales_ops_user:
            payload.sales_ops_user_block.sales_ops_user.selected_user,
          legal_user: payload.legal_user_block.legal_user.selected_user,
        };
      }

      // save new proposed structure info
      if (view.callback_id === "save_proposed_structure") {
        user_settings[index].proposed_structure = {
          close_date: payload.close_date_block.close_date.selected_date,
          acv_churn: payload.acv_churn_block.acv_churn.value,
          billings: payload.billings_block.billings.value,
          tcv: payload.tcv_block.tcv.value,
          subscription_term:
            payload.subscription_term_block.subscription_term.value,
          payment_terms: payload.payment_terms_block.payment_terms.value,
          payment_frequency:
            payload.payment_frequency_block.payment_frequency.value,
        };
      }

      // save new quote lines info
      if (view.callback_id === "save_quote_lines") {
        user_settings[index].quote_lines = {
          licenses: payload.licenses_block.licenses.value,
        };
      }

      // save new approver details
      if (view.callback_id === "save_approver_details") {
        user_settings[index].approver_details = {
          l1_details: payload.l1_details_block.l1_details.value,
          l2_details: payload.l2_details_block.l2_details.value,
          sales_ops_details:
            payload.sales_ops_details_block.sales_ops_details.value,
          legal_details: payload.legal_details_block.legal_details.value,
        };
      }

      // save new quote line details
      if (view.callback_id === "save_quote_line_details") {
        user_settings[index].quote_line_details = {
          product_name: payload.product_name_block.product_name.value,
          quantity: payload.quantity_block.quantity.value,
          start_date: payload.start_date_block.start_date.selected_date,
          end_date: payload.end_date_block.end_date.selected_date,
          one_time_credit: payload.one_time_credit_block.one_time_credit.value,
          aov: payload.aov_block.aov.value,
        };
      }

      // save new deal stats
      if (view.callback_id === "save_deal_stats") {
        console.log(payload);
        user_settings[index].deal_stats = {
          employee_count: payload.employee_count_block.employee_count.value,
          active_seats: payload.active_seats_block.active_seats.value,
          quote: payload.quote_block.quote.value,
          new_aov: payload.new_aov_block.new_aov.value,
          existing_aov: payload.existing_aov_block.existing_aov.value,
          assigned_em: payload.assigned_em_block.assigned_em.value,
          type: payload.type_block.type.value,
          prior_year_opportunity:
            payload.prior_year_opportunity_block.prior_year_opportunity.value,
          uncapped_renewal_base:
            payload.uncapped_renewal_base_block.uncapped_renewal_base.value,
          has_invoice_teams:
            payload.has_invoice_teams_block.has_invoice_teams.value === "true"
              ? true
              : false,
        };
      }

      fs.writeFile(
        "./settings/user_settings.json",
        JSON.stringify({ user_settings }, null, 2),
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
    const { user_settings } = require("./settings/user_settings.json");
    const { approver_users } = user_settings.find((item) => {
      return (
        item.user_id === command.user_id && item.team_id === command.team_id
      );
    });
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
    const { user_settings } = require("./settings/user_settings.json");
    const { approver_users } = user_settings.find((item) => {
      return (
        item.user_id === body.user.id && item.team_id === body.user.team_id
      );
    });
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
    const { user_settings } = require("./settings/user_settings.json");
    const { approver_users } = user_settings.find((item) => {
      return item.user_id === body.user.id && item.team_id === body.team.id;
    });
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
      team_id: body.team.id,
    });

    const { user_settings } = require("./settings/user_settings.json");
    const user_settings_obj = user_settings.find(
      (item) => item.user_id === body.user.id && item.team_id === body.team.id
    );

    const {
      l1_user,
      l2_user,
      sales_ops_user,
      legal_user,
    } = user_settings_obj.approver_users;

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
        user_settings_obj,
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
    const { user_settings } = require("./settings/user_settings.json");
    const user_settings_obj = user_settings.find(
      (item) => item.user_id === body.user.id && item.team_id === body.team.id
    );

    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: approver_details(user_settings_obj.approver_details),
    });
  } catch (error) {
    console.error(error);
  }
});

// display quote lines details modal
app.action("quote_lines_details", async ({ ack, context, body }) => {
  await ack();
  try {
    const { user_settings } = require("./settings/user_settings.json");
    const user_settings_obj = user_settings.find(
      (item) => item.user_id === body.user.id && item.team_id === body.team.id
    );

    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: quote_line_details(user_settings_obj.quote_line_details),
    });
  } catch (error) {
    console.error(error);
  }
});

// display deal stats modal
app.action("deal_stats", async ({ ack, context, body }) => {
  await ack();
  try {
    const { user_settings } = require("./settings/user_settings.json");
    const user_settings_obj = user_settings.find(
      (item) => item.user_id === body.user.id && item.team_id === body.team.id
    );

    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: deal_stats(user_settings_obj.deal_stats),
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

    const { user_settings } = require("./settings/user_settings.json");
    const user_settings_obj = user_settings.find(
      (item) => item.user_id === body.user.id && item.team_id === body.team.id
    );

    const {
      l1_user,
      l2_user,
      sales_ops_user,
      legal_user,
    } = user_settings_obj.approver_users;

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
        user_settings_obj,
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
      user_settings_obj,
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
      user_settings_obj,
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
      user_settings_obj,
    });

    // notify user that discount has been approved
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: body.user.id,
      blocks: discount_approved(companyName),
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
