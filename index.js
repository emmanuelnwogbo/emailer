require("dotenv").config();
const express = require("express");
const validator = require("validator");
const xssFilters = require("xss-filters");
const http = require("http");

const app = express();

const sgMail = require("@sendgrid/mail");

const sendgridKey = process.env.MAILER_KEY;

sgMail.setApiKey(sendgridKey);

app.use(express.json());

app.get("/", function (req, res) {
  res.status(405).json({ error: "sorry!" });
});

app.post("/", function (req, res) {
  const attributes = ["name", "email", "msg"];
  const sanitizedAttributes = attributes.map((n) =>
    validateAndSanitize(n, req.body[n])
  );

  const someInvalid = sanitizedAttributes.some((r) => !r);

  if (someInvalid) {
    return res.status(422).json({ error: "Ugh.. That looks unprocessable!" });
  }

  const msg = {
    to: "mariosmith7070@gmail.com",
    from: "mariosmith7070@gmail.com",
    subject: "Contact from your portfolio website, Samson",
    text: sanitizedAttributes[2],
    html: `<p>${sanitizedAttributes[2]}</p></br><strong>from ${sanitizedAttributes[1]}, ${sanitizedAttributes[0]} to Samson</strong>`,
  };

  sgMail
    .send(msg)
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: "OH YEAH" });
    })
    .catch((err) => {
      console.log(err);
    });
});

const validateAndSanitize = (key, value) => {
  const rejectFunctions = {
    name: (v) => v.length < 4,
    email: (v) => !validator.isEmail(v),
    msg: (v) => v.length < 10,
  };

  // If object has key and function returns false, return sanitized input. Else, return false
  return (
    rejectFunctions.hasOwnProperty(key) &&
    !rejectFunctions[key](value) &&
    xssFilters.inHTMLData(value)
  );
};

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, async (error) => {
  if (error) {
    return error;
  }

  return console.log(`server started on port ${PORT}`);
});
