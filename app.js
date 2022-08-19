const http = require('http'),
  express = require('express'),
  cors = require('cors'),
  app = express(),
  axios = require('axios'),
  nodemailer = require("nodemailer");

const nodemailerConfig = require("./config/mail.config.json"),
  recaptchaConfig = require("./config/recapcha.config.json");

app.use(express.json());
app.set('json spaces', 2);

app.use(express.urlencoded({ extended: true }));
app.use(cors());

let transporter = nodemailer.createTransport(nodemailerConfig);

app.post('/mail/send', async (req, res) => {
  let reCaptchaRes = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaConfig.secretKey}&response=${req.body["recaptcha_response"]}`);
  if(reCaptchaRes.data.success != true)
    res.status(400).send("Invalid reCAPTCHA");

  if(typeof req.body.name != "string" || req.body.name.length > 64)
    res.status(400).send("Invalid body parameter name");

  if(typeof req.body.email != "string" || !(req.body.email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)))
    res.status(400).send("Invalid body parameter email");

  if(typeof req.body.message != "string")
    res.status(400).send("Invalid body parameter message");

  try{
    await transporter.sendMail({
      //from: 'mikkel@mikkelsv.dk',
      to: "mikkel@mikkelsv.dk",
      replyTo: `"${req.body.name}" <${req.body.email}>`,
      subject: "Enquiry via website",
      text: req.body.message,
    });
  } catch (err) {
    res.status(400).send("A unknown error occurred");
  }

  res.send("Success");
});

http.createServer(app).listen(80);