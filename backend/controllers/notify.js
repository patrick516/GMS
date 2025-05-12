const express = require("express");
const router = express.Router();
const { sendWhatsApp } = require("../utils/twilio");

router.post("/", async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res
      .status(400)
      .json({ success: false, message: "Missing phone or message" });
  }

  try {
    await sendWhatsApp(phone, message);
    res
      .status(200)
      .json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    console.error("Failed to send WhatsApp:", err.message);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

module.exports = router;
