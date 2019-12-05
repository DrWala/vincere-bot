// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require("botbuilder");
const request = require("request");

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        let allPossibleResponses = [];

        // Initial load
        console.log("INFO: Reading data from API");
        request(
            "https://sheetsu.com/apis/v1.0su/7e0eaa894b3d",
            { json: true },
            (err, res, body) => {
                if (err) {
                    return console.log(err);
                }
                allPossibleResponses = body;
                console.log("INFO: Data read complete");
            }
        );

        // Timeout to read every 5 minutes
        setInterval(function() {
            console.log("INFO: Reading data from API");
            request(
                "https://sheetsu.com/apis/v1.0su/7e0eaa894b3d",
                { json: true },
                (err, res, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    allPossibleResponses = body;
                    console.log("INFO: Data read complete");
                }
            );
        }, 300000);

        this.onMessage(async (context, next) => {
            let msg = context._activity.text;
            console.log(`Processing: ${msg}`);

            if(msg.indexOf('@') !== '-1' || msg.substring(0, msg.indexOf('@sir_vincere_bot') !== '')) {

                if(!msg.indexOf('@') !== '-1') {
                    msg = msg.substring(0, msg.indexOf('@sir_vincere_bot'))
                }
                let thisResp = allPossibleResponses
                    .map(obj => obj[msg])
                    .filter(obj => obj !== undefined)
                    .filter(str => str !== "");
                await context.sendActivity(
                    thisResp[Math.floor(Math.random() * thisResp.length)]
                );
    
                console.log(thisResp);
                if (thisResp[0] === undefined) {
                    await context.sendActivity(
                        "Alas! I cannot comprehend the words of a fool."
                    );
                }
                // By calling next() you ensure that the next BotHandler is run.
                await next();
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
}

module.exports.EchoBot = EchoBot;
