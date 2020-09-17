const moment = require("moment");

module.exports = {
  approver_details: ({
    l1_details,
    l2_details,
    sales_ops_details,
    legal_details,
  }) => ({
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
            text: l1_details,
          },
          {
            type: "mrkdwn",
            text: "*L2 Details*",
          },
          {
            type: "plain_text",
            text: l2_details,
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
            text: sales_ops_details,
          },
          {
            type: "mrkdwn",
            text: "*Legal Details*",
          },
          {
            type: "plain_text",
            text: legal_details,
          },
        ],
      },
    ],
  }),
  deal_stats: ({
    employee_count,
    active_seats,
    quote,
    new_aov,
    existing_aov,
    assigned_em,
    type,
    prior_year_opportunity,
    uncapped_renewal_base,
    has_invoice_teams,
  }) => ({
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
            text: employee_count,
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
            text: active_seats,
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
            text: quote,
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
            text: new_aov,
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
            text: existing_aov,
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
            text: assigned_em,
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
            text: type,
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
            text: prior_year_opportunity,
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
            text: uncapped_renewal_base,
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
            text: has_invoice_teams ? "Yes" : "No",
          },
        ],
      },
    ],
  }),
  edit_approvers: ({ approver_users }) => ({
    type: "modal",
    callback_id: "save_approver_users",
    title: {
      type: "plain_text",
      text: "Approvers",
      emoji: true,
    },
    submit: {
      type: "plain_text",
      text: "Save",
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
        block_id: "l1_user_block",
        element: {
          type: "users_select",
          placeholder: {
            type: "plain_text",
            text: "Select a user",
            emoji: true,
          },
          action_id: "l1_user",
          initial_user: approver_users.l1_user || undefined,
        },
        label: {
          type: "plain_text",
          text: ":l1: - Level 1 Sales",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "l2_user_block",
        element: {
          type: "users_select",
          placeholder: {
            type: "plain_text",
            text: "Select a user",
            emoji: true,
          },
          action_id: "l2_user",
          initial_user: approver_users.l2_user || undefined,
        },
        label: {
          type: "plain_text",
          text: ":l2: - Level 2 Sales",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "sales_ops_user_block",
        element: {
          type: "users_select",
          placeholder: {
            type: "plain_text",
            text: "Select a user",
            emoji: true,
          },
          action_id: "sales_ops_user",
          initial_user: approver_users.sales_ops_user || undefined,
        },
        label: {
          type: "plain_text",
          text: ":sales_ops: - SalesOps",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "legal_user_block",
        element: {
          type: "users_select",
          placeholder: {
            type: "plain_text",
            text: "Select a user",
            emoji: true,
          },
          action_id: "legal_user",
          initial_user: approver_users.legal_user || undefined,
        },
        label: {
          type: "plain_text",
          text: ":legal: - Legal",
          emoji: true,
        },
      },
    ],
  }),
  edit_approver_details: ({ approver_details }) => ({
    type: "modal",
    callback_id: "save_approver_details",
    title: {
      type: "plain_text",
      text: "Approver Details",
      emoji: true,
    },
    submit: {
      type: "plain_text",
      text: "Save",
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
        block_id: "l1_details_block",
        element: {
          type: "plain_text_input",
          initial_value: approver_details.l1_details,
          action_id: "l1_details",
        },
        label: {
          type: "plain_text",
          text: "L1 Details",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "l2_details_block",
        element: {
          type: "plain_text_input",
          initial_value: approver_details.l2_details,
          action_id: "l2_details",
        },
        label: {
          type: "plain_text",
          text: "L2 Details",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "sales_ops_details_block",
        element: {
          type: "plain_text_input",
          initial_value: approver_details.sales_ops_details,
          action_id: "sales_ops_details",
        },
        label: {
          type: "plain_text",
          text: "SalesOps Details",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "legal_details_block",
        element: {
          type: "plain_text_input",
          initial_value: approver_details.legal_details,
          action_id: "legal_details",
        },
        label: {
          type: "plain_text",
          text: "Legal Details",
          emoji: true,
        },
      },
    ],
  }),
  edit_deal_stats: ({ deal_stats }) => ({
    type: "modal",
    callback_id: "save_deal_stats",
    title: {
      type: "plain_text",
      text: "Deal Stats",
      emoji: true,
    },
    submit: {
      type: "plain_text",
      text: "Save",
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
        block_id: "employee_count_block",
        element: {
          type: "plain_text_input",
          action_id: "employee_count",
          initial_value: deal_stats.employee_count,
        },
        label: {
          type: "plain_text",
          text: "Employee Count",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "active_seats_block",
        element: {
          type: "plain_text_input",
          action_id: "active_seats",
          initial_value: deal_stats.active_seats,
        },
        label: {
          type: "plain_text",
          text: "Active Licenses Under Contract",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "quote_block",
        element: {
          type: "plain_text_input",
          action_id: "quote",
          initial_value: deal_stats.quote,
        },
        label: {
          type: "plain_text",
          text: "Quote",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "new_aov_block",
        element: {
          type: "plain_text_input",
          action_id: "new_aov",
          initial_value: deal_stats.new_aov,
        },
        label: {
          type: "plain_text",
          text: "New AOV",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "existing_aov_block",
        element: {
          type: "plain_text_input",
          action_id: "existing_aov",
          initial_value: deal_stats.existing_aov,
        },
        label: {
          type: "plain_text",
          text: "Existing AOV",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "assigned_em_block",
        element: {
          type: "plain_text_input",
          action_id: "assigned_em",
          initial_value: deal_stats.assigned_em,
        },
        label: {
          type: "plain_text",
          text: "Assigned EM",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "type_block",
        element: {
          type: "plain_text_input",
          action_id: "type",
          initial_value: deal_stats.type,
        },
        label: {
          type: "plain_text",
          text: "Type",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "prior_year_opportunity_block",
        element: {
          type: "plain_text_input",
          action_id: "prior_year_opportunity",
          initial_value: deal_stats.prior_year_opportunity,
        },
        label: {
          type: "plain_text",
          text: "Prior Year Opportunity AOV",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "uncapped_renewal_base_block",
        element: {
          type: "plain_text_input",
          action_id: "uncapped_renewal_base",
          initial_value: deal_stats.uncapped_renewal_base,
        },
        label: {
          type: "plain_text",
          text: "Uncapped Renewal Base",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "has_invoice_teams_block",
        element: {
          type: "radio_buttons",
          action_id: "has_invoice_teams",
          initial_option: deal_stats.has_invoice_teams
            ? {
                text: {
                  type: "plain_text",
                  text: "Yes",
                  emoji: true,
                },
                value: "true",
              }
            : {
                text: {
                  type: "plain_text",
                  text: "No",
                  emoji: true,
                },
                value: "false",
              },
          options: [
            {
              text: {
                type: "plain_text",
                text: "Yes",
                emoji: true,
              },
              value: "true",
            },
            {
              text: {
                type: "plain_text",
                text: "No",
                emoji: true,
              },
              value: "false",
            },
          ],
        },
        label: {
          type: "plain_text",
          text: "Has Invoice Teams",
          emoji: true,
        },
      },
    ],
  }),
  edit_proposed_structure: ({ proposed_structure }) => ({
    type: "modal",
    callback_id: "save_proposed_structure",
    title: {
      type: "plain_text",
      text: "Proposed Structure",
      emoji: true,
    },
    submit: {
      type: "plain_text",
      text: "Save",
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
        block_id: "close_date_block",
        element: {
          type: "datepicker",
          placeholder: {
            type: "plain_text",
            text: "Select a date",
            emoji: true,
          },
          initial_date: proposed_structure.close_date,
          action_id: "close_date",
        },
        label: {
          type: "plain_text",
          text: `Close Date ${proposed_structure.close_date}`,
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "acv_churn_block",
        element: {
          type: "plain_text_input",
          initial_value: proposed_structure.acv_churn,
          action_id: "acv_churn",
        },
        label: {
          type: "plain_text",
          text: "ACV (Churn)",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "billings_block",
        element: {
          type: "plain_text_input",
          initial_value: proposed_structure.billings,
          action_id: "billings",
        },
        label: {
          type: "plain_text",
          text: "Billings",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "tcv_block",
        element: {
          type: "plain_text_input",
          initial_value: proposed_structure.tcv,
          action_id: "tcv",
        },
        label: {
          type: "plain_text",
          text: "Total Contract Value (TCV)",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "subscription_term_block",
        element: {
          type: "plain_text_input",
          initial_value: proposed_structure.subscription_term,
          action_id: "subscription_term",
        },
        label: {
          type: "plain_text",
          text: "Subscription Term",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "payment_terms_block",
        element: {
          type: "plain_text_input",
          initial_value: proposed_structure.payment_terms,
          action_id: "payment_terms",
        },
        label: {
          type: "plain_text",
          text: "Payment Terms",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "payment_frequency_block",
        element: {
          type: "plain_text_input",
          initial_value: proposed_structure.payment_frequency,
          action_id: "payment_frequency",
        },
        label: {
          type: "plain_text",
          text: "Payment Frequency",
          emoji: true,
        },
      },
    ],
  }),
  edit_quote_lines: ({ quote_lines }) => ({
    type: "modal",
    callback_id: "save_quote_lines",
    title: {
      type: "plain_text",
      text: "Quote Lines",
      emoji: true,
    },
    submit: {
      type: "plain_text",
      text: "Save",
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
        block_id: "licenses_block",
        element: {
          type: "plain_text_input",
          initial_value: quote_lines.licenses,
          action_id: "licenses",
        },
        label: {
          type: "plain_text",
          text: "Number of Licenses",
          emoji: true,
        },
      },
    ],
  }),
  edit_quote_line_details: ({ quote_line_details }) => ({
    type: "modal",
    callback_id: "save_quote_line_details",
    title: {
      type: "plain_text",
      text: "Quote Line Details",
      emoji: true,
    },
    submit: {
      type: "plain_text",
      text: "Save",
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
        block_id: "product_name_block",
        element: {
          type: "plain_text_input",
          action_id: "product_name",
          initial_value: quote_line_details.product_name,
        },
        label: {
          type: "plain_text",
          text: "Product Name",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "quantity_block",
        element: {
          type: "plain_text_input",
          action_id: "quantity",
          initial_value: quote_line_details.quantity,
        },
        label: {
          type: "plain_text",
          text: "Quantity",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "start_date_block",
        element: {
          type: "datepicker",
          placeholder: {
            type: "plain_text",
            text: "Select a date",
            emoji: true,
          },
          action_id: "start_date",
          initial_date: quote_line_details.start_date,
        },
        label: {
          type: "plain_text",
          text: "Start Date",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "end_date_block",
        element: {
          type: "datepicker",
          placeholder: {
            type: "plain_text",
            text: "Select a date",
            emoji: true,
          },
          action_id: "end_date",
          initial_date: quote_line_details.end_date,
        },
        label: {
          type: "plain_text",
          text: "End Date",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "one_time_credit_block",
        element: {
          type: "plain_text_input",
          action_id: "one_time_credit",
          initial_value: quote_line_details.one_time_credit,
        },
        label: {
          type: "plain_text",
          text: "One Time Credit",
          emoji: true,
        },
      },
      {
        type: "input",
        block_id: "aov_block",
        element: {
          type: "plain_text_input",
          action_id: "aov",
          initial_value: quote_line_details.aov,
        },
        label: {
          type: "plain_text",
          text: "AOV",
          emoji: true,
        },
      },
    ],
  }),
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
  quote_line_details: ({
    product_name,
    quantity,
    start_date,
    end_date,
    one_time_credit,
    aov,
  }) => ({
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
            text: product_name,
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
            text: quantity,
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
            text: start_date,
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
            text: end_date,
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
            text: one_time_credit,
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
            text: aov,
          },
        ],
      },
    ],
  }),
};
