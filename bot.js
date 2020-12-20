// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require("botbuilder");
const request = require("request");

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        let command_map = {};

        // Initial load
        console.log("INFO: Reading data from API");
        request(
            "https://api.airtable.com/v0/appw8rrMigzB8sp9N/Commands?api_key=keyvYRqsOQcalWZ8O",
            { json: true },
            (err, res, body) => {
                if (err) {
                    return console.log(err);
                }
                command_map = this.formatAirtableResponse(body);
                console.log("INFO: Data read complete");
                console.log(command_map);
            }
        );

        // Timeout to read every 5 minutes
        setInterval(function () {
            console.log("INFO: Reading data from API");
            request(
                "https://api.airtable.com/v0/appw8rrMigzB8sp9N/Commands?api_key=keyvYRqsOQcalWZ8O",
                { json: true },
                (err, res, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    command_map = this.formatAirtableResponse(body);
                    console.log("INFO: Data read complete");
                    console.log(command_map);
                }
            );
        }, 300000);

        this.onMessage(async (context, next) => {
            let msg = context._activity.text;
            if (msg != undefined && msg != null) {
                console.log(`Processing: ${msg}`);
                if (
                    msg.indexOf("@") !== "-1" &&
                    msg.substring(0, msg.indexOf("@sir_vincere_bot")) !== ""
                ) {
                    msg = msg.substring(0, msg.indexOf("@sir_vincere_bot"));
                    let thisResp = command_map[msg];
                    await context.sendActivity(
                        thisResp[Math.floor(Math.random() * thisResp.length)]
                    );
                    if (thisResp[0] === undefined) {
                        await context.sendActivity(
                            "Alas! I cannot comprehend the words of a fool."
                        );
                    }
                    // By calling next() you ensure that the next BotHandler is run.
                    await next();
                } else if (msg == "@sir_vincere_bot") {
                    await context.sendActivity("Yes you called?");
                    await next();
                } else {
                    await next();
                }
            }
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity("Hello and welcome!");
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    formatAirtableResponse(resp) {
        let command_map = {};
        for (let index = 0; index < resp.records.length; index++) {
            const record = resp.records[index].fields;
            let name = record["Name"];
            command_map[name] = [];
            for (const [key, value] of Object.entries(record)) {
                if (key != "Name") {
                    command_map[name].push(value);
                }
            }
        }
        return command_map;
    }
}

module.exports.EchoBot = EchoBot;
