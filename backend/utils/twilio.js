const twilio = require("twilio");
require("dotenv").config();

console.log(" TWILIO SID:", process.env.TWILIO_ACCOUNT_SID);

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

exports.sendWhatsApp = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from,
      to: `whatsapp:${to}`,
    });

    console.log("WhatsApp sent:", result.sid);
    return result;
  } catch (error) {
    console.error(" WhatsApp send error:", error.message);
    throw error;
  }
};
