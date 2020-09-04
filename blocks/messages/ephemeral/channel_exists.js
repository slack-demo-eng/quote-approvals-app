module.exports = {
  channelExists: (companyName) => [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:open_mouth: Oops! It looks like a discount approval has already been requested for this customer. You can check it out in this channel here :point_right: #quote-approvals-${companyName}`,
      },
    },
  ],
};
