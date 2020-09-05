const moment = require("moment");

module.exports = {
  launch_modal: {
    type: "modal",
    callback_id: "launch_modal_submit",
    title: {
      type: "plain_text",
      text: "Quote Approvals Bot",
      emoji: true,
    },
    submit: {
      type: "plain_text",
      text: "Submit",
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: "Cancel",
      emoji: true,
    },
    blocks: [
      {
        type: "input",
        block_id: "companyName",
        element: {
          type: "plain_text_input",
          action_id: "user_input",
          placeholder: {
            type: "plain_text",
            text: "Write something",
          },
        },
        label: {
          type: "plain_text",
          text: ":star2: Company/Opportunity Name",
          emoji: true,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "plain_text",
            text: "e.g. Acme Corp",
            emoji: true,
          },
        ],
      },
      {
        type: "input",
        block_id: "justification",
        element: {
          type: "plain_text_input",
          action_id: "user_input",
          multiline: true,
        },
        label: {
          type: "plain_text",
          text: ":memo: Justification",
          emoji: true,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "plain_text",
            text: "e.g. Guaranteed order of 10,000 units in first month",
            emoji: true,
          },
        ],
      },
      {
        type: "input",
        block_id: "discount",
        element: {
          type: "plain_text_input",
          action_id: "user_input",
          max_length: 2,
        },
        label: {
          type: "plain_text",
          text: ":chart_with_downwards_trend: % Discount",
          emoji: true,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "plain_text",
            text: "e.g. 10",
            emoji: true,
          },
        ],
      },
    ],
  },
  approval_details: {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Approval Details",
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: "Close",
    },
    blocks: [
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*L1 Details*",
          },
          {
            type: "plain_text",
            text: "Non Standard Legal Language",
          },
          {
            type: "mrkdwn",
            text: "*L2 Details*",
          },
          {
            type: "plain_text",
            text: "Non Standard Legal Language",
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*SalesOps Details*",
          },
          {
            type: "plain_text",
            text: "Non Standard Legal Language",
          },
          {
            type: "mrkdwn",
            text: "*Legal Details*",
          },
          {
            type: "plain_text",
            text: "Non Standard Legal Language",
          },
        ],
      },
    ],
  },
  quote_lines_details: {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Quote Line Details",
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: "Close",
    },
    blocks: [
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Product Name:*",
          },
          {
            type: "plain_text",
            text: "Plus plan",
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Quantity:*",
          },
          {
            type: "plain_text",
            text: "250",
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Start Date:*",
          },
          {
            type: "mrkdwn",
            text: `${moment().format("MM-DD-YYYY")}`,
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*End Date:*",
          },
          {
            type: "mrkdwn",
            text: `${moment().add(1, "y").format("MM-DD-YYYY")}`,
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*One Time Credit:*",
          },
          {
            type: "plain_text",
            text: "$0",
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*AOV:*",
          },
          {
            type: "plain_text",
            text: "$45,974",
          },
        ],
      },
    ],
  },
  deal_stats: {
    type: "modal",
    title: {
      type: "plain_text",
      text: "Deal Stats",
      emoji: true,
    },
    close: {
      type: "plain_text",
      text: "Close",
    },
    blocks: [
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Employee Count:*",
          },
          {
            type: "plain_text",
            text: "2,450",
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Active Seats Under Contract:*",
          },
          {
            type: "plain_text",
            text: "N/A",
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Quote:*",
          },
          {
            type: "mrkdwn",
            text:
              "<https://media.giphy.com/media/l9XgkOGzT3mm1TQCxW/giphy.gif|Q-12695>",
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*New AOV:*",
          },
          {
            type: "mrkdwn",
            text: "$45,974",
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Existing AOV:*",
          },
          {
            type: "mrkdwn",
            text: "$0",
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Assigned EM:*",
          },
          {
            type: "plain_text",
            text: "N/A",
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Type:*",
          },
          {
            type: "plain_text",
            text: "New Business",
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Prior Year Opportunity AOV:*",
          },
          {
            type: "plain_text",
            text: "$0",
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Uncapped Renewal Base:*",
          },
          {
            type: "plain_text",
            text: "$0",
          },
        ],
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: "*Has Invoice Teams:*",
          },
          {
            type: "plain_text",
            text: "Yes",
          },
        ],
      },
    ],
  },
};
