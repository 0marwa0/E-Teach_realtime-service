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

app.use(bodyParser.json({ type: ["application/json"] }));
app.use(bodyParser.text({ type: "text/plain" }));

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
  console.log("Type:", type);
  console.log("Raw body:", req.body);

  let body;

  // Try to parse the body (handle both string and already-parsed objects)
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (e) {
    console.error("Could not parse body:", e.message);
    return res.status(400).send("Invalid body");
  }

  // Just log what we got
  console.log("Parsed body:", body);

  if (type === "SubscriptionConfirmation") {
    const subscribeURL = body?.SubscribeURL;
    console.log("SubscribeURL:", subscribeURL);

    if (!subscribeURL) {
      return res.status(400).send("Missing SubscribeURL");
    }

    // Optional: auto-confirm subscription
    // await axios.get(subscribeURL);

    return res.sendStatus(200);
  }

  if (type === "Notification") {
    const message = JSON.parse(body?.Message);
    const { meetingId, eventType } = message;

    io.emit("zoom-event", {
      type: eventType,
      meetingId,
    });

    console.log(`Zoom event: ${eventType} for meeting: ${meetingId}`);
    return res.sendStatus(200);
  }

  return res.status(400).send("Unknown type");
});
