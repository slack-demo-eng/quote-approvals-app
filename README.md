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

All of the below `.env` variables are *required* in order for the app to function properly

- `SLACK_SIGNING_SECRET`
- `SLACK_CLIENT_ID`
- `SLACK_CLIENT_SECRET`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_DATABASE`

### :link: Slack App Link

[Click Here](https://slack-demo-eng.slack.com/apps/A01AJDXR8SJ-quote-approvals?did_revoke_all=1&next_id=0) to view the App Directory page


## :rocket: Deployment

App is deployed on Heroku and any changes to the `master` branch of this repo are reflected in the live app
