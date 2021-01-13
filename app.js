const { App } = require("@slack/bolt");
const dotenv = require("dotenv");
const axios = require("axios");
const fs = require("fs");

// import consts
const { new_user } = require("./settings/new_user");

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

// import database functions
const {
  storeInstallationInDb,
  fetchInstallationFromDb,
  deleteInstallationFromDb,
  storeUserSettings,
  fetchUserSettings,
} = require("./db/helpers");

// initialize env variables
dotenv.config();

// intialize app
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  scopes: [
    "channels:history",
    "channels:manage",
    "chat:write",
    "chat:write.public",
    "commands",
    "users:read",
    "channels:read",
    "links:read",
    "groups:write",
  ],
  installerOptions: {
    userScopes: ["channels:history"],
  },
  installationStore: {
    storeInstallation: async (installation) => {
      // store installation in database
      await storeInstallationInDb(installation);

      // store default user settings in database
      const enterpriseId = installation.enterprise
        ? installation.enterprise.id
        : undefined;
      let settings = await fetchUserSettings(
        installation.team.id,
        enterpriseId
      );

      if (!settings) {
        const newUserSettings = new_user(installation.team.id, enterpriseId);
        await storeUserSettings(newUserSettings);
      }
    },
    fetchInstallation: async ({ teamId, enterpriseId }) => {
      // fetch installation from database
      const installation = await fetchInstallationFromDb({
        teamId,
        enterpriseId,
      });
      return installation;
    },
  },
});

/* UTILITY FUNCTIONS 🧰 */

// check if approver users exist at each level
const isApproversConfigured = (approver_users) => {
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
  settings,
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
        settings,
      }),
    });
  } catch (error) {
    console.error(error);
  }
};

/* SETTINGS ⚙️ */

// listen for app home tab opened
app.event("app_home_opened", async ({ body, context, logger }) => {
  try {
    let settings = await fetchUserSettings(body.team_id, body.enterprise_id);

    if (!settings) {
      const newUserSettings = new_user(body.team_id, body.enterprise_id);
      await storeUserSettings(newUserSettings);
      settings = await fetchUserSettings(body.team_id, body.enterprise_id);
    }

    // determine if app installed on current workspace
    const isInstalled = body.team_id === body.authorizations[0].team_id;

    // load app home
    await app.client.views.publish({
      token: context.botToken,
      user_id: body.event.user,
      view: app_home(
        settings.channel_type,
        process.env.APP_INSTALL_LINK,
        isInstalled
      ),
    });
  } catch (error) {
    console.log(`app_home_opened error - TEAM_ID = ${body.team_id}`);
    logger.error(error);
  }
});

// listen for configure approvers button click
app.action("configure_approvers", async ({ ack, body, context, logger }) => {
  try {
    await ack();
    let settings = await fetchUserSettings(
      body.team.id,
      body.team.enterprise_id
    );
    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: modals.edit_approvers(settings),
    });
  } catch (error) {
    console.log(`configure_approvers error - TEAM_ID = ${body.team.id}`);
    logger.error(error);
  }
});

// listen for edit button click
app.action(
  /^(edit_approvers|edit_proposed_structure|edit_quote_lines|edit_approver_details|edit_quote_line_details|edit_deal_stats|edit_platform_image|edit_sales_order_form_link).*/,
  async ({ ack, action, body, context, logger }) => {
    try {
      await ack();

      let settings = await fetchUserSettings(
        body.user.team_id,
        body.team.enterprise_id
      );

      // push values to edit modal
      await app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: modals[action.action_id](settings),
      });
    } catch (error) {
      console.log(`edit config error - TEAM_ID = ${body.user.team_id}`);
      logger.error(error);
    }
  }
);

// listen for edit channel type
app.action("edit_channel_type", async ({ ack, action, body, logger }) => {
  try {
    await ack();
    let settings = await fetchUserSettings(
      body.user.team_id,
      body.team.enterprise_id
    );

    // save new channel type
    settings.channel_type = action.selected_option.value;
    await storeUserSettings(settings);
  } catch (error) {
    console.log(`edit channel type error - TEAM_ID = ${body.user.team_id}`);
    logger.error(error);
  }
});

// listen for save of new approver users
app.view(
  /^(save_approver_users|save_proposed_structure|save_quote_lines|save_approver_details|save_quote_line_details|save_deal_stats|save_platform_image|save_sales_order_form_link).*/,
  async ({ ack, body, view, logger }) => {
    try {
      await ack();
      const settings = await fetchUserSettings(
        body.team.id,
        body.team.enterprise_id
      );

      const payload = view.state.values;

      // save new approver users info
      if (view.callback_id === "save_approver_users") {
        settings.approver_users = {
          l1_user: payload.l1_user_block.l1_user.selected_user,
          l2_user: payload.l2_user_block.l2_user.selected_user,
          sales_ops_user:
            payload.sales_ops_user_block.sales_ops_user.selected_user,
          legal_user: payload.legal_user_block.legal_user.selected_user,
        };
      }

      // save new proposed structure info
      if (view.callback_id === "save_proposed_structure") {
        settings.proposed_structure = {
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
        settings.quote_lines = {
          licenses: payload.licenses_block.licenses.value,
        };
      }

      // save new approver details
      if (view.callback_id === "save_approver_details") {
        settings.approver_details = {
          l1_details: payload.l1_details_block.l1_details.value,
          l2_details: payload.l2_details_block.l2_details.value,
          sales_ops_details:
            payload.sales_ops_details_block.sales_ops_details.value,
          legal_details: payload.legal_details_block.legal_details.value,
        };
      }

      // save new quote line details
      if (view.callback_id === "save_quote_line_details") {
        settings.quote_line_details = {
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
        settings.deal_stats = {
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

      // save platform image
      if (view.callback_id === "save_platform_image") {
        settings.platform_image = {
          url: payload.url_block.url.value,
        };
      }

      // save sales order form link
      if (view.callback_id === "save_sales_order_form_link") {
        settings.sales_order_form = {
          url: payload.url_block.url.value,
        };
      }

      // store new user settings in database
      await storeUserSettings(settings);
    } catch (error) {
      console.log(`save config error - TEAM_ID = ${body.team.id}`);
      logger.error(error);
    }
  }
);

// restore config defaults
app.action("restore_defaults", async ({ ack, body, logger }) => {
  try {
    await ack();
    const settings = new_user(body.user.team_id, body.team.enterprise_id);
    return await storeUserSettings(settings);
  } catch (error) {
    console.log(`restore defaults error - TEAM_ID = ${body.user.team_id}`);
    logger.error(error);
  }
});

app.event("app_uninstalled", async ({ body, logger }) => {
  try {
    await deleteInstallationFromDb(body.team_id, body.enterprise_id);
  } catch (error) {
    console.log(`app_uninstalled error - TEAM_ID = ${body.team_id}`);
    logger.error(error);
  }
});

// acknowledge no functionality button clicks
app.action(/uninstall_app|external_link.*/, async ({ ack, body, logger }) => {
  try {
    await ack();
  } catch (error) {
    console.log(`plain ack error - TEAM_ID = ${body.user.team_id}`);
    logger.error(error);
  }
});

/* LAUNCH 🚀 */

// listen for slash command
app.command("/discount", async ({ ack, command, context, logger }) => {
  try {
    await ack();
    const settings = await fetchUserSettings(
      command.team_id,
      command.enterprise_id
    );
    const users_configured = isApproversConfigured(settings.approver_users);

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
    console.log(`slash command error - TEAM_ID = ${command.team_id}`);
    logger.error(error);
  }
});

// listen for shortcut
app.shortcut(
  "discount_request",
  async ({ ack, body, context, shortcut, logger }) => {
    try {
      await ack();
      const settings = await fetchUserSettings(
        body.team.id,
        body.team.enterprise_id
      );

      const users_configured = isApproversConfigured(settings.approver_users);

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
            workspace_id: body.team.id,
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
      console.log(`shortcut error - TEAM_ID = ${body.team.id}`);
      logger.error(error);
    }
  }
);

// listen for mentions of 'discount'
app.message(/discount/i, async ({ context, message, logger }) => {
  try {
    // send ephemaral message
    await app.client.chat.postEphemeral({
      token: context.botToken,
      channel: message.channel,
      user: message.user,
      blocks: discount_mention,
    });
  } catch (error) {
    console.log(`discount listener error - USER = ${message.user}`);
    logger.error(error);
  }
});

// listen for launch from ephemeral message
app.action("launch_discount", async ({ ack, body, context, logger }) => {
  try {
    await ack();
    const settings = await fetchUserSettings(
      body.team.id,
      body.team.enterprise_id
    );

    const users_configured = isApproversConfigured(settings.approver_users);

    // send ephemeral message if approvers not configured
    if (!users_configured) {
      await app.client.chat.postEphemeral({
        token: context.botToken,
        channel: body.channel.id,
        user: body.user.id,
        blocks: redirect_home({
          workspace_id: body.team.id,
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
    console.log(`launch_discount error - TEAM_ID = ${body.team.id}`);
    logger.error(error);
  }
});

// listen for cancel from ephemeral message
app.action("cancel_ephemeral", async ({ ack, body, logger }) => {
  try {
    await ack();
    // must use response_url to delete ephemeral messages
    axios
      .post(body.response_url, {
        delete_original: "true",
      })
      .catch((error) => logger.error(error));
  } catch (error) {
    console.log(`cancel_ephemeral error - TEAM_ID = ${body.team.id}`);
    logger.error(error);
  }
});

/* NEW CHANNEL CREATION ✨ */

let companyName, justification, discount;

// listen for modal submission
app.view(
  "launch_modal_submit",
  async ({ ack, body, context, view, logger }) => {
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
          blocks: channel_exists({
            companyName,
            channelId: existingChannel.id,
          }),
        });
        return;
      }

      const settings = await fetchUserSettings(
        body.team.id,
        body.team.enterprise_id
      );

      // create channel
      const response = await app.client.conversations.create({
        token: context.botToken,
        name: `quote-approvals-${channelName
          .replace(/\W+/g, "-")
          .toLowerCase()}`,
        team_id: body.team.id,
        is_private: settings.channel_type === "private",
      });

      const {
        l1_user,
        l2_user,
        sales_ops_user,
        legal_user,
      } = settings.approver_users;

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
        blocks: channel_created({
          companyName,
          channelId: response.channel.id,
        }),
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
          settings,
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
      console.log(`launch_modal_submit error - TEAM_ID = ${body.team.id}`);
      logger.error(error);
    }
  }
);

/* QUOTE DETAILS 📄 */

// display approval details modal
app.action("status_details", async ({ ack, context, body, logger }) => {
  try {
    await ack();
    const settings = await fetchUserSettings(
      body.team.id,
      body.team.enterprise_id
    );

    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: approver_details(settings.approver_details),
    });
  } catch (error) {
    console.log(`status_details error - TEAM_ID = ${body.team.id}`);
    logger.error(error);
  }
});

// display quote lines details modal
app.action("quote_lines_details", async ({ ack, context, body, logger }) => {
  try {
    await ack();
    const settings = await fetchUserSettings(
      body.team.id,
      body.team.enterprise_id
    );

    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: quote_line_details(settings.quote_line_details),
    });
  } catch (error) {
    console.log(`quote_lines_details error - TEAM_ID = ${body.team.id}`);
    logger.error(error);
  }
});

// display deal stats modal
app.action("deal_stats", async ({ ack, context, body, logger }) => {
  try {
    await ack();
    const settings = await fetchUserSettings(
      body.team.id,
      body.team.enterprise_id
    );

    await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: deal_stats(settings.deal_stats),
    });
  } catch (error) {
    console.log(`deal_stats error - TEAM_ID = ${body.team.id}`);
    logger.error(error);
  }
});

/* MESSAGE THREAD 🧵 */

// listen for 'Approve' or 'Reject' button press in thread
app.action(
  /^(approve|reject).*/,
  async ({ ack, action, context, body, logger }) => {
    try {
      await ack();
      // inform user of authority status
      await app.client.chat.postEphemeral({
        token: context.botToken,
        user: body.user.id,
        channel: body.channel.id,
        thread_ts: body.message.thread_ts,
        blocks: thread_error({ user: body.user.id, action: action.action_id }),
      });

      const settings = await fetchUserSettings(
        body.team.id,
        body.team.enterprise_id
      );

      const {
        l1_user,
        l2_user,
        sales_ops_user,
        legal_user,
      } = settings.approver_users;

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
          settings,
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
        settings,
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
        settings,
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
        settings,
      });

      // notify user that discount has been approved
      await app.client.chat.postMessage({
        token: context.botToken,
        channel: body.user.id,
        blocks: discount_approved(companyName, settings.sales_order_form.url),
      });
    } catch (error) {
      console.log(`approve/reject error - TEAM_ID = ${body.team.id}`);
      logger.error(error);
    }
  }
);

app.error(async (error) => {
  console.error(error);
});

// start app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Quote Approvals Bot is running!");
})();
