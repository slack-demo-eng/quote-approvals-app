module.exports = {
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
};
