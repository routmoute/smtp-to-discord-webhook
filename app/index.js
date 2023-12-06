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

    const chunks = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));

    stream.on('end', () => {
      const message = Buffer.concat(chunks).toString('utf8').split('\r\n\r\n');
      const head = message[0].split('\r\n');
      const body = message[1];

      let decodedMessage;
      let subject;
      head.forEach(elem => {
        const splittedElem = elem.split(': ');
        if (splittedElem[0] == 'Content-Type') {
          if (splittedElem[1] == 'base64') {
            decodedMessage = Buffer.from(body, 'base64').toString('utf8');
          } else {
            decodedMessage = body.split('=0D=0A').join('\r\n');
          }
        } else if (splittedElem[0] == 'Subject') {
          subject = splittedElem[1];
        }
      });

      fetch(discordWebhookUrl, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          embeds: [{
            title: subject,
            description: decodedMessage
          }]
        })
      }).then((res) => {
        if (res.status < 200 || res.status > 299) {
          res.text().then((textRes) => {
            console.log("Error: Send to discord failed: %s", textRes);
          }).catch((err) => {
            console.log("Error: Discord response parse failed: %s", err);
          });
        } else {
          console.log("Message sended to Discord.");
        }
      }).catch((err) => {
        console.log("Error: Send to discord failed: %s", err);
      });
      callback();
    });
  }
});

server.on("error", (err) => {
  console.log("Error %s", err.message);
});

server.listen(25);
