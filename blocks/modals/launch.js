module.exports = {
  type: "modal",
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
      element: {
        type: "plain_text_input",
        placeholder: {
          type: "plain_text",
          text: "Write something",
        },
      },
      label: {
        type: "plain_text",
        text: ":office: Company/Opportunity Name",
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
      element: {
        type: "plain_text_input",
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
      element: {
        type: "plain_text_input",
      },
      label: {
        type: "plain_text",
        text: ":dart: Discount (%)",
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
