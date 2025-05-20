const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/sns-listener", async (req, res) => {
  const type = req.headers["x-amz-sns-message-type"];

  if (type === "SubscriptionConfirmation") {
    const subscribeURL = req.body.SubscribeURL;
    console.log(`Confirming subscription at: ${subscribeURL}`);

    // You can auto-confirm or manually visit the URL
    return res.sendStatus(200);
  }

  if (type === "Notification") {
    const message = JSON.parse(req.body.Message);
    console.log("SNS Event Received:", message);

    // Example: Push to WebSocket, log, etc.
    if (message.eventType === "meeting.started") {
      console.log(`Meeting started: ${message.meetingId}`);
      // TODO: Notify frontend via WebSocket or trigger something
    }

    return res.sendStatus(200);
  }

  return res.sendStatus(400);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Realtime service running on port ${PORT}`);
});
