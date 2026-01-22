const smtpUsername = process.env.SMTP_USERNAME;
if (smtpUsername == undefined || smtpUsername == "") {
  throw new Error("SMTP_USERNAME environment variable is empty.");
}

const smtpPassword = process.env.SMTP_PASSWORD;
if (smtpPassword == undefined || smtpPassword == "") {
  throw new Error("SMTP_PASSWORD environment variable is empty.");
}

const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
if (discordWebhookUrl == undefined || discordWebhookUrl == "") {
  throw new Error("DISCORD_WEBHOOK_URL environment variable is empty.");
}

const SMTPServer = require("smtp-server").SMTPServer;
const { simpleParser } = require("mailparser");
const server = new SMTPServer({
  secure: false,
  allowInsecureAuth: true,
  disableReverseLookup: true,

  onAuth(auth, session, callback) {
    if (auth.username != smtpUsername || auth.password != smtpPassword) {
      console.log("Error: Connection failed: Invalid username or password");
      return callback(new Error("Invalid username or password"));
    }
    callback(null, { user: 1 });
  },

  onData(stream, session, callback) {
    console.log("A message has been received.");

    simpleParser(stream, async (err, parsed) => {
      if (err) {
        console.log("Error: Failed to parse email: %s", err.message);
        return callback();
      }

      const subject = parsed.subject || "(No Subject)";
      const text = parsed.text || parsed.html || "(No content)";

      try {
        const response = await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            embeds: [{
              title: subject,
              description: text.substring(0, 4096) // Discord embed limit
            }]
          })
        });

        if (response.status < 200 || response.status > 299) {
          const errorText = await response.text();
          console.log("Error: Send to discord failed: %s", errorText);
        } else {
          console.log("Message sent to Discord.");
        }
      } catch (err) {
        console.log("Error: Send to discord failed: %s", err.message);
      }

      callback();
    });
  }
});

server.on("error", (err) => {
  console.log("Error %s", err.message);
});

server.listen(25);
