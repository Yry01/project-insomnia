const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const sql = require('mssql');


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// config for your database
const config = {
  user: 'CloudSA4069d47d',
  password: 'yuerunyu1.',
  server: 'chat-town.database.windows.net', 
  database: 'chat-town', 
  options: {
    encrypt: true,
    enableArithAbort: true
  }
};

// connect to your database
sql.connect(config, function (err) {
  if (err) console.log(err);
  else console.log('Database connected');
});





app.post("/send-sms", (req, res) => {
  const accountSid = "AC662c7db6285d6b82a91d93d37a8ab278";
  const authToken = "0f444eb16079fadab4a282c6297ea813";
  const client = twilio(accountSid, authToken);

  const { to, body } = req.body;

  client.messages
    .create({
      body: body,
      from: "+15075805415",
      to: to,
    })
    .then((message) => res.status(200).json({ message: "SMS sent!" }))
    .catch((err) => {
      res.status(500).json({ message: "Something went wrong" });
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
