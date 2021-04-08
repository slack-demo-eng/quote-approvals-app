<p align="center">
  <img src="https://avatars.slack-edge.com/2020-09-15/1371410566820_3597bb68914fe21478f4_512.png" alt="Quote Approvals" width="200" />
</p>

<div align="center">
  <h1>Quote Approvals Demo Guide</h1>
</div>

For a detailed guide on how to use the app (with GIFs!) please head :point_right: [here](https://docs.google.com/document/d/13CHXzCkpyCMfTeWT7SyCkyn0_Nf-csxsL6TYx2BXp4M/edit?usp=sharing)

## 📃 Description

This demo app is based on the [@ApprovalsBot - Deals](https://slack-sales-and-cs.slack.com/apps/ANLSXKXNF-approvalsbot-deals?next_id=0) that currently exists inside of TinySpeck.

The app can be used to demonstrate the power of Slack in coordinating a discount approval process for a potential new customer.

## ⚙️ Setup

### :earth_americas: ENV Variables

All of the below `.env` variables are _required_ in order for the app to function properly

- `APP_ID`
- `APP_INSTALL_LINK`
- `APP_NAME`
- `DB_DATABASE`
- `DB_HOST`
- `DB_PASSWORD`
- `DB_TABLE_INSTALLS`
- `DB_TABLE_USER_SETTINGS`
- `DB_USER`
- `SLACK_SIGNING_SECRET`
- `SLACK_CLIENT_ID`
- `SLACK_CLIENT_SECRET`
- `SLACK_STATE_SECRET`

### :link: Slack App Link

[Click Here](https://slack-demo-eng.slack.com/apps/A01AJDXR8SJ-quote-approvals?did_revoke_all=1&next_id=0) to view the App Directory page

### Running Locally

Ensure the app is running locally using the following `ngrok` command:

```
ngrok http -subdomain='quote-approvals-dev' 3000
```

## :rocket: Deployment

App is deployed on Heroku and any changes to the `master` branch of this repo are reflected in the live app
