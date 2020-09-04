module.exports = {
  channel_exists: (companyName, channelName) => [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:open_mouth: Oops! It looks like a discount approval has *already been requested* for ${companyName}. You can check it out in this channel here :point_right: #quote-approvals-${channelName}`,
      },
    },
  ],
  channel_created: (companyName, channelName) => [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:tada: Awesome! You just started a discount approval process* for ${companyName}. You can watch it play out here :point_right: #quote-approvals-${channelName}`,
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
};
