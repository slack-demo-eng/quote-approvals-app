const moment = require("moment");

const new_user = (user_id, team_id) => ({
  user_id,
  team_id,
  approver_users: {
    l1_user: "",
    l2_user: "",
    sales_ops_user: "",
    legal_user: "",
  },
  proposed_structure: {
    close_date: `${moment().format("YYYY-MM-DD")}`,
    acv_churn: "$0",
    billings: "$0",
    tcv: "$45,974",
    subscription_term: "12",
    payment_terms: "Net 30",
    payment_frequency: "Standard",
  },
  quote_lines: {
    licenses: "250",
  },
  approver_details: {
    l1_details: "Non Standard Legal Language",
    l2_details: "Non Standard Legal Language",
    sales_ops_details: "Non Standard Legal Language",
    legal_details: "Non Standard Legal Language",
  },
  quote_line_details: {
    product_name: "Plus plan",
    quantity: "250",
    start_date: `${moment().format("YYYY-MM-DD")}`,
    end_date: `${moment().add(1, "y").format("YYYY-MM-DD")}`,
    one_time_credit: "$0",
    aov: "$45,974",
  },
  deal_stats: {
    employee_count: "2,450",
    active_seats: "N/A",
    quote:
      "<https://media.giphy.com/media/l9XgkOGzT3mm1TQCxW/giphy.gif|Q-12695>",
    new_aov: "$45,974",
    existing_aov: "$0",
    assigned_em: "N/A",
    type: "New Business",
    prior_year_opportunity: "$0",
    uncapped_renewal_base: "$0",
    has_invoice_teams: true,
  },
});

module.exports = {
  new_user,
};
