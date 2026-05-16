const express = require('express');
const router = express.Router();
const colors = require('colors');
const { debug } = require('./../config.json')
router.use('/', function (req, res, next) {
    const requestBody = req.body;
    if (requestBody && requestBody.type === "validation.webhook") {
        if (debug === true) { console.log(`${colors.yellow('Handler move to: return req.body')}`); }
        return res.status(200).json(req.body);
    }

    if (debug === true) { console.log(`${colors.yellow('Handler move to: next();')}`); }
    return next();
});

module.exports = router;
