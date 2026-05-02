const express = require("express");
const { getTopNotifications } = require("./notification");
const { Log } = require("../logging_middleware/index");

const app = express();

app.get("/notifications/top", async (req, res) => {
  try {
    const result = await getTopNotifications();
    await Log("backend", "info", "service", "Fetched top notifications successfully");
    res.json(result);
  } catch (err) {
    await Log("backend", "error", "service", `Notification fetch failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log("Notification service running on port 3001");
});
