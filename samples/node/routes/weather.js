/*
* Copyright © 2017 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

"use strict";

const uuidV4 = require('uuid/v4');

exports.requestCards = function(req, res) {
    if (!req.body.tokens) {
        res.status(400).send("Missing tokens field");
        return;
    }

    // Treat missing zips and empty zips the same way
    const zips = req.body.tokens.zip || [];

    // Real connectors will probably insist on receiving X-Routing-Prefix.
    // We will be more lax here.
    const routingPrefix = req.headers['x-routing-prefix'] || '/';

    res.json({cards: zips.map(function(zip){
      return toCard(zip, routingPrefix);
    })});
};

exports.testAuth = function(req, res) {
  res.status(200).send();
}

exports.reportWeather = function (req, res) {
    console.log(`Reporting temperature of ${req.body.temperature} for ${req.body.zip}`);
    res.status(200).end();
};

function toCard(zip, routingPrefix) {
    const description = [
        'Start',
        '\\',
        '\"',
        'AAA',
        '\u0000 \u0001 \u0002 \u0003 \u0004 \u0005 \u0006 \u0007 \u0008 \u0009 \u000a \u000b \u000c \u000d \u000e \u000f',
        '\u0010 \u0011 \u0012 \u0013 \u0014 \u0015 \u0016 \u0017 \u0018 \u0019 \u001a \u001b \u001c \u001d \u001e \u001f',
        '\u007f',
        'BBB',
        '\u0080 \u0081 \u0082 \u0083 \u0084 \u0085 \u0086 \u0087 \u0088 \u0089 \u008a \u008b \u008c \u008d \u008e \u008f',
        '\u0090 \u0091 \u0092 \u0093 \u0094 \u0095 \u0096 \u0097 \u0098 \u0099 \u009a \u009b \u009c \u009d \u009e \u009f',
        '\u00ad',
        'CCC',
        '\u0600 \u0601 \u0602 \u0603 \u0604',
        '\u070f',
        '\u17b4',
        '\u17b5',
        'DDD',
        '\u200c \u200d \u200e \u200f',
        '\u2028 <-- these 2 are a problem --> \u2029 \u202a \u202b \u202c \u202d \u202e \u202f',
        '\u2060 \u2061 \u2062 \u2063 \u2064 \u2065 \u2066 \u2067 \u2068 \u2069 \u206a \u206b \u206c \u206d \u206e \u206f',
        '\ufeff',
        '\ufff0 \ufff1 \ufff2 \ufff3 \ufff4 \ufff5 \ufff6 \ufff7 \ufff8 \ufff9 \ufffa \ufffb \ufffc \ufffd \ufffe \uffff',
        'FFF',
        'End'
    ];

    return {
        id: uuidV4(),
        template: {
            href: `${routingPrefix}templates/generic.hbs`
        },
        header: {
            title: `Weather forecast for ${zip}`
        },
        body: {
            description: description.join(',\r\n '),
            fields: [
                {
                    type: "GENERAL",
                    title: "Temperature",
                    description: "75"
                }, {
                    type: "GENERAL",
                    title: "Conditions",
                    description: "Sunny"
                }
            ]
        },
        actions: [
            {
                id: uuidV4(),
                action_key: "USER_INPUT",
                label: "Report weather",
                completed_label: "Weather reported successfully",
                url: {
                    href: `${routingPrefix}reports`
                },
                type: "POST",
                request: {
                    zip: zip
                },
                user_input: [
                    {
                        id: "temperature",
                        label: `Please enter temperature for ${zip}`
                    }
                ]
            }
        ]
    };
}
