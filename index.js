const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const app = express();
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(bodyParser.json());
const PORT = process.env.PORT || 5001;

app.listen(PORT, () =>
  console.log(`Real time service running on port ${PORT}`)
);
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
app.get("/", (req, res) => {
  res.send("real time service!!");
});
app.post("/sns-listener", async (req, res) => {
  const type = req.headers["x-amz-sns-message-type"];

  if (type === "SubscriptionConfirmation") {
    // Confirm SNS Subscription
    const subscribeURL = req?.body?.SubscribeURL;
    console.log(`Confirm this URL: ${subscribeURL}`);
    return res.sendStatus(200);
  }

  if (type === "Notification") {
    const subscribeURL = req?.body?.SubscribeURL;

    console.log(`Confirm this URL: ${subscribeURL}`);

    const message = JSON.parse(req.body.Message);
    const { meetingId, eventType } = message;
    io.emit("zoom-event", {
      type: eventType,
      meetingId,
    });

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
