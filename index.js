const express = require("express");
const { Log } = require("./logging_middleware/index");

const app = express();
app.use(express.json());

app.get("/test", async (req, res) => {
  await Log("backend", "info", "route", "Test route called");
  res.send("OK");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
