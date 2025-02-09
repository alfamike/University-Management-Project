const express = require('express');
const { enrollUser } = require('../kaleido/auth-helper');
const KaleidoClient = require("../kaleido/kaleido");
const {join} = require("path");
const os = require("os");
const {FileSystemWallet, Gateway} = require("fabric-network");
const fs = require("fs-extra");
const router = express.Router();


router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        // const certificate = await enrollUser(username, password);
        //
        // // Save user session
        // req.session.user = {
        //     username,
        //     certificate
        // };

        // Redirect to home

        res.redirect('/home');
    } catch (error) {
        res.status(500).json({ message: 'Failed to register user', error: error.message });
    }
});

module.exports = router;
