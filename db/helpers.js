const mysql = require("mysql");
const dotenv = require("dotenv");
const moment = require("moment");
const fs = require("fs");

// initialize env variables
dotenv.config();

// connect to db
const connection = mysql.createPool({
  connectionLimit: 1,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const appName = "APPROVALS";

// store tokens in db
const storeTokens = (installation) => {
  let sql =
    "INSERT INTO demo_app_tokens VALUES (?, ?, ?, ?, ?, ? ,?, ?, ?) ON DUPLICATE KEY UPDATE user_token= ?, bot_token = ?, installed_on = ?";
  const inserts = [
    appName,
    installation.user.id,
    installation.team.id,
    installation.team.name,
    installation.enterprise ? installation.enterprise.id : "NULL",
    installation.enterprise ? installation.enterprise.name : "NULL",
    installation.user.token,
    installation.bot.token,
    moment().format("YYYY-MM-DD HH:mm:ss"),
    installation.user.token,
    installation.bot.token,
    moment().format("YYYY-MM-DD HH:mm:ss"),
  ];
  sql = mysql.format(sql, inserts);

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

// store installation object locally inside installations.json
const storeLocalInstallation = (installation) => {
  const { installations } = require("./installations");

  const index = installations.findIndex((existingInstallation) => {
    return existingInstallation.user.id === installation.user.id;
  });

  // strip out tokens
  installation.user.token = "";
  installation.bot.token = "";

  // update existing installation if exists
  if (~index) {
    installations[index] = installation;
  } else {
    installations.push(installation);
  }

  fs.writeFile(
    "./db/installations.json",
    JSON.stringify({ installations }, null, 2),
    (err) => {
      if (err) console.error(error);
    }
  );
};

// retrieve tokens from db
const retrieveTokens = (teamId) => {
  let sql =
    "SELECT user_token, bot_token FROM demo_app_tokens WHERE team_id = ? AND app_name = ?";
  const inserts = [teamId, appName];
  sql = mysql.format(sql, inserts);

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        reject(err);
      }
      if (result) {
        resolve(result[0]);
      }
    });
  });
};

// fetch installation from installations.json and attach tokens
const fetchLocalInstallation = (tokens, teamId) => {
  const { installations } = require("./installations.json");
  const installation = installations.find((item) => {
    return item.team.id === teamId;
  });

  if (installation && installation.bot && installation.user) {
    installation.bot.token = tokens.bot_token;
    installation.user.token = tokens.user_token;
  }
  return installation;
};

module.exports = {
  storeTokens,
  storeLocalInstallation,
  retrieveTokens,
  fetchLocalInstallation,
};
