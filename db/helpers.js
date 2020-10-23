const mysql = require("mysql");
const dotenv = require("dotenv");
const moment = require("moment");

// initialize env variables
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

// installation object
const installationObject = ({
  team_id,
  team_name,
  user_token,
  user_id,
  bot_token,
  bot_user_id,
  bot_id,
  org_id,
  org_domain,
}) => ({
  team: {
    id: team_id,
    name: team_name,
  },
  appId: process.env.APP_ID,
  user: {
    token: user_token,
    scopes: ["channels:history"],
    id: user_id,
  },
  bot: {
    scopes: [
      "channels:history",
      "channels:manage",
      "chat:write",
      "chat:write.public",
      "commands",
      "users:read",
      "channels:read",
      "links:read",
    ],
    token: bot_token,
    userId: bot_user_id,
    id: bot_id,
  },
  tokenType: "bot",
  enterprise:
    org_id !== "NULL"
      ? {
          id: org_id,
          name: org_domain,
        }
      : undefined,
});

// connect to db
const connection = mysql.createPool({
  connectionLimit: 1,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// store tokens in db
const storeInstallationInDb = (installation) => {
  let sql = `INSERT INTO ${process.env.DB_TABLE_INSTALLS} VALUES (?, ?, ?, ?, ?, ? ,?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE user_token= ?, bot_token = ?, installed_on = ?`;
  const inserts = [
    process.env.APP_NAME,
    installation.user.id,
    installation.team.id,
    installation.team.name,
    installation.enterprise ? installation.enterprise.id : "NULL",
    installation.enterprise ? installation.enterprise.name : "NULL",
    installation.user.token,
    installation.bot.token,
    moment().format("YYYY-MM-DD HH:mm:ss"),
    installation.bot.userId,
    installation.bot.id,
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

// retrieve tokens from db
const fetchInstallationFromDb = ({ teamId, enterpriseId }) => {
  let sql = `SELECT * FROM ${process.env.DB_TABLE_INSTALLS} WHERE ${
    enterpriseId ? "org_id" : "team_id"
  } = ? AND app_name = ?`;
  const inserts = enterpriseId
    ? [enterpriseId, process.env.APP_NAME]
    : [teamId, process.env.APP_NAME];
  sql = mysql.format(sql, inserts);

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length > 0) {
        if (enterpriseId) {
          const index = result.findIndex(
            (teamInstallation) => teamInstallation.team_id === teamId
          );
          if (index !== -1) {
            // return current workspace install
            return resolve(installationObject(result[index]));
          }
        }
        // return org install if in workspace without install or workspace install for non-enterprise
        return resolve(installationObject(result[0]));
      }
    });
  });
};

const deleteInstallationFromDb = (teamId) => {
  let sql = `DELETE FROM ${process.env.DB_TABLE_INSTALLS} WHERE team_id = ? AND app_name = ?`;
  const inserts = [teamId, process.env.APP_NAME];
  sql = mysql.format(sql, inserts);

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result) {
        resolve();
      }
    });
  });
};

const storeUserSettings = (settings) => {
  const jsonPayload = JSON.stringify(settings);
  const enterpriseId = settings.enterprise_id || "NULL";
  let sql = `INSERT INTO ${process.env.DB_TABLE_USER_SETTINGS} VALUES (?, ?, ?, NULL, NULL, ?, 'team_config') ON DUPLICATE KEY UPDATE json_value= ?`;
  const inserts = [
    settings.team_id,
    process.env.APP_ID,
    enterpriseId,
    jsonPayload,
    jsonPayload,
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

const fetchUserSettings = (teamId, enterpriseId) => {
  let sql = `SELECT * FROM ${process.env.DB_TABLE_USER_SETTINGS} WHERE${
    enterpriseId ? ` key_string = '${enterpriseId}' AND` : ""
  } team_id = ? AND app_id = ?`;
  const inserts = [teamId, process.env.APP_ID];
  sql = mysql.format(sql, inserts);

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        return reject(err);
      }
      if (result.length === 0) {
        return resolve(false);
      }

      if (result.length > 0) {
        if (enterpriseId) {
          const index = result.findIndex(
            (teamInstallation) => teamInstallation.team_id === teamId
          );
          if (index !== -1) {
            // return current workspace settings if app installed on workspace
            const { json_value } = result[index];
            return resolve(JSON.parse(json_value));
          }
        }
        // return org settings if in workspace without install or workspace settings for non-enterprise
        const { json_value } = result[0];
        return resolve(JSON.parse(json_value));
      }
    });
  });
};

module.exports = {
  storeInstallationInDb,
  fetchInstallationFromDb,
  deleteInstallationFromDb,
  storeUserSettings,
  fetchUserSettings,
};
