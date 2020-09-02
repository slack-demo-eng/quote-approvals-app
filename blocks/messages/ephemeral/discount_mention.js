module.exports = [
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
];
