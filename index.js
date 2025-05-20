const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.post("/sns-listener", async (req, res) => {
  const type = req.headers["x-amz-sns-message-type"];

  if (type === "SubscriptionConfirmation") {
    // Confirm SNS Subscription
    const subscribeURL = req.body.SubscribeURL;
    console.log(`Confirm this URL: ${subscribeURL}`);
    return res.sendStatus(200);
  }

  if (type === "Notification") {
    const message = JSON.parse(req.body.Message);
    const { meetingId, eventType } = message;

    console.log(`Zoom event: ${eventType} for meeting: ${meetingId}`);

    // Example actions per event type:
    switch (eventType) {
      case "meeting.started":
        // TODO: push real-time update
        break;
      case "meeting.ended":
        // TODO: update DB or notify user
        break;
      case "recording.ready":
        // TODO: send email or notify frontend
        break;
      default:
        console.log("Unhandled event type");
    }

    return res.sendStatus(200);
  }

  return res.sendStatus(400);
});
