const twilio = require("twilio");
require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Use WhatsApp sandbox number (DO NOT remove whatsapp:)
const from = "whatsapp:+14155238886";

const client = twilio(accountSid, authToken);

exports.sendWhatsApp = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from,
      to: `whatsapp:${to}`, // ✅ Add 'whatsapp:' prefix
    });

    console.log("WhatsApp sent:", result.sid);
    return result;
  } catch (error) {
    console.error("WhatsApp send error:", error.message);
    throw error;
  }
};
