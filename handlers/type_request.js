const express = require('express');
const router = express.Router();
const colors = require('colors');
const { debug } = require('./../config.json')
router.use('/', function (req, res, next) {
    const requestBody = req.body;
    // Check if the request body contains the type "validation.webhook"
    // for Tebex webhook validation
    if (requestBody && requestBody.type == "validation.webhook") {
        // Respond with the same body to validate the webhook
        if (debug == true) { console.log(`${colors.yellow('Handler move to: return req.body')}`); }
        return res.status(200).json(req.body);
    } else {
        // Move to the next middleware or route handler
        if (debug == true) { console.log(`${colors.yellow('Handler move to: next();')}`); }
        next();
    }
});

module.exports = router;
