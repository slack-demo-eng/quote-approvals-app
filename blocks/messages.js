const moment = require("moment");

module.exports = {
  app_home: ({ l1_user, l2_user, sales_ops_user, legal_user }) => ({
    type: "home",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Welcome to *Quote Approvals* :wave:`,
        },
      },
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Approvers",
          emoji: true,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "Below you can choose the *approvers* at each level of the approval flow:",
        },
      },
      {
        type: "section",
        text: {
          type: "plain_text",
          text: " ",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ":l1: - `Level 1 Sales`",
        },
        accessory: {
          type: "users_select",
          placeholder: {
            type: "plain_text",
            text: "Select a user",
            emoji: true,
          },
          action_id: "l1_user",
          initial_user: l1_user || undefined,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ":l2: - `Level 2 Sales`",
        },
        accessory: {
          type: "users_select",
          placeholder: {
            type: "plain_text",
            text: "Select a user",
            emoji: true,
          },
          action_id: "l2_user",
          initial_user: l2_user || undefined,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ":sales_ops: - `Sales Ops`",
        },
        accessory: {
          type: "users_select",
          placeholder: {
            type: "plain_text",
            text: "Select a user",
            emoji: true,
          },
          action_id: "sales_ops_user",
          initial_user: sales_ops_user || undefined,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ":legal: - `Legal`",
        },
        accessory: {
          type: "users_select",
          placeholder: {
            type: "plain_text",
            text: "Select a user",
            emoji: true,
          },
          action_id: "legal_user",
          initial_user: legal_user || undefined,
        },
      },
    ],
  }),
  channel_created: ({ companyName, channelId }) => [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Awesome! :tada: You just *started a discount approval process* for ${companyName}. You can watch it play out here :point_right: <#${channelId}>`,
      },
    },
  ],
  channel_exists: ({ companyName, channelId }) => [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Oops! :open_mouth: It looks like a discount approval has *already been requested* for ${companyName}. You can check it out in this channel here :point_right: <#${channelId}>`,
      },
    },
  ],
  discount_mention: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          ":eyes: It sounds like you're considering a discount. Would you like to start the *discount approval process*?",
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Let's get started! :rocket:",
            emoji: true,
          },
          style: "primary",
          action_id: "launch_discount",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Nope!",
            emoji: true,
          },
          action_id: "cancel_ephemeral",
        },
      ],
    },
  ],
  channel_message: ({ user, companyName, justification, discount, status }) => [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<@${user}> is requesting approval for *${companyName}*`,
      },
      accessory: {
        type: "image",
        image_url: "https://quote-approvals.s3.amazonaws.com/salesforce_1.png",
        alt_text: "salesforce",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":+1: *Approvals Required:*",
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${status > 0 ? ":l1_complete:" : ":l1:"} > ${
          status > 1 ? ":l2_complete:" : ":l2:"
        } > ${status > 2 ? ":sales_ops_complete:" : ":sales_ops:"} > ${
          status > 3 ? ":legal_complete:" : ":legal:"
        }`,
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "Details",
          emoji: true,
        },
        action_id: "status_details",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":handshake: *Proposed Structure*",
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: "*Close Date:*",
        },
        {
          type: "plain_text",
          text: `${moment().format("MM-DD-YYYY")}`,
        },
        {
          type: "mrkdwn",
          text: "*ACV (Churn):*",
        },
        {
          type: "plain_text",
          text: "$0",
        },
        {
          type: "mrkdwn",
          text: "*Billings:*",
        },
        {
          type: "plain_text",
          text: "$0",
        },
        {
          type: "mrkdwn",
          text: "*Total Contract Value (TCV):*",
        },
        {
          type: "plain_text",
          text: "$45,974",
        },
        {
          type: "mrkdwn",
          text: "*Subscription Term:*",
        },
        {
          type: "plain_text",
          text: "12",
        },
      ],
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: "*Max Discount:*",
        },
        {
          type: "mrkdwn",
          text: `${discount}%`,
        },
        {
          type: "mrkdwn",
          text: "*Payment Terms:*",
        },
        {
          type: "plain_text",
          text: "Net 30",
        },
        {
          type: "mrkdwn",
          text: "*Payment Frequency:*",
        },
        {
          type: "plain_text",
          text: "Standard",
        },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: " ",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":ok_hand: *Asks & Justification:*",
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${justification}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: " ",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":writing_hand: *Quote Lines:*",
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*250* x licenses with \`${discount}%\` discount`,
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "Details",
          emoji: true,
        },
        action_id: "quote_lines_details",
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Deal Stats",
            emoji: true,
          },
          action_id: "deal_stats",
        },
      ],
    },
  ],
  redirect_home: ({ workspace_id, app_id }) => [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Uh oh! :grimacing: We seem to be missing some *approvers*...",
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Configure Approvers :gear:",
            emoji: true,
          },
          action_id: "take_me_home",
          url: `slack://app?team=${workspace_id}&id=${app_id}&tab=home`,
        },
      ],
    },
  ],
  thread_approved: ({ approver, approval_level }) => [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:white_check_mark: <@${approver}> approved \`${approval_level}\`.`,
      },
    },
  ],
  thread_ask: ({ approver, approval_type }) => [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:wave: Hello <@${approver}> - please submit your \`${approval_type}\` approval`,
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Approve",
          },
          style: "primary",
          action_id: "approve",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Reject",
          },
          style: "danger",
          action_id: "reject",
        },
      ],
    },
  ],
  thread_error: ({ user, action }) => [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:cry: Sorry <@${user}> - you do not have the authority to *${action}* this request`,
      },
    },
  ],
};
