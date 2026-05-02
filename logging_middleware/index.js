require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });
const axios = require("axios");

const authSession = {
    key: null,
    validUntil: 0
};

const getAuthToken = async () => {
    const currentTime = Math.floor(Date.now() / 1000);

    if (authSession.key && authSession.validUntil > currentTime + 60) {
        return authSession.key;
    }

    const credentials = {
        email: process.env.EVAL_EMAIL,
        name: process.env.EVAL_NAME,
        rollNo: process.env.EVAL_ROLL_NO,
        accessCode: process.env.EVAL_ACCESS_CODE,
        clientID: process.env.EVAL_CLIENT_ID,
        clientSecret: process.env.EVAL_CLIENT_SECRET
    };

    try {
        const authResponse = await axios.post(
            "http://20.207.122.201/evaluation-service/auth",
            credentials
        );

        authSession.key = authResponse.data.access_token;
        // The evaluation server returns an absolute Unix timestamp for expires_in, not a relative duration.
        authSession.validUntil = authResponse.data.expires_in;

        return authSession.key;
    } catch (error) {
        console.error("Auth Exception:", error.message);
        return null;
    }
};

const Log = async (stack, level, pkg, message) => {
    const allowedStacks = new Set(["backend", "frontend"]);
    const allowedLevels = new Set(["debug", "info", "warn", "error", "fatal"]);
    const allowedPackages = new Set([
        "cache", "controller", "cron_job", "db", "domain",
        "handler", "repository", "route", "service"
    ]);

    const s = stack.toLowerCase();
    const l = level.toLowerCase();
    const p = pkg.toLowerCase();

    if (!allowedStacks.has(s) || !allowedLevels.has(l) || !allowedPackages.has(p)) {
        return;
    }

    const activeToken = await getAuthToken();
    if (!activeToken) return;

    try {
        await axios.post(
            "http://20.207.122.201/evaluation-service/logs",
            { stack: s, level: l, package: p, message },
            { headers: { Authorization: `Bearer ${activeToken}` } }
        );
    } catch (error) {
        console.error("Logging Exception:", error.message);
    }
};

module.exports = { Log, getAuthToken };
