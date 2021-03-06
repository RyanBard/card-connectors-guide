/*
* Copyright © 2017 VMware, Inc. All Rights Reserved.
* SPDX-License-Identifier: BSD-2-Clause
*/

"use strict";

const express = require('express');
const app = express();
const commandLineArgs = require('command-line-args');
const weather = require('./routes/weather');
const discovery = require('./routes/discovery');

const optionDefinitions = [
    {name: 'port', type: Number, defaultValue: 3000}
];

const options = commandLineArgs(optionDefinitions);

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set('trust proxy', true);
app.use(['/cards/requests', '/reports'], function (req, res, next) {
    const authorization = req.header("authorization");
    const xAuthorization = req.header("X-Connector-Authorization");
    if (authorization) {
        console.log(`Client passed "${authorization}". We should authenticate using the public key from the Mobile Flows Server`);
    } else {
        return res.status(401).send("Missing Authorization header");
    }
    if (xAuthorization) {
        console.log(`Client passed "${xAuthorization}". Connector will use this to fetch info from the backend Weather system.`);
        next();
    } else {
        const r = res.status(400);
        r.setHeader('X-Backend-Status', 401);
        r.send("Missing X-Connector-Authorization header");
    }
});

app.get('/', discovery.root);
app.use(express.static('public'));

// Request cards
app.post('/cards/requests', weather.requestCards);

// Test authentication
app.get('/test-auth', weather.testAuth);

// Perform an action. Note that "/connectors/weather/" is required by Hero to route here, but "/reports"
// is all we see here.
app.post('/reports', weather.reportWeather);

// Connector-level action to Clear all reported data
app.post('/clear', weather.clearData);

app.listen(options.port, function () {
    console.log(`Connector listening on port ${options.port}.`);
});
