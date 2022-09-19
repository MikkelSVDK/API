const http = require('http'),
  express = require('express'),
  cors = require('cors'),
  app = express(),
  axios = require('axios'),
  nodemailer = require("nodemailer"),
  { make } = require('simple-body-validator');

const nodemailerConfig = require("./config/mail.config.json"),
  recaptchaConfig = require("./config/recapcha.config.json");

app.use(express.json());
app.set('json spaces', 2);

app.use(express.urlencoded({ extended: true }));
app.use(cors());

let transporter = nodemailer.createTransport(nodemailerConfig);

app.post('/mail/send', async (req, res) => {
  const validator = make(req.body, {
    recaptcha_response: 'required',
    name: 'required|string|min:3|max:64',
    email: 'required|email',
    message: 'required|string'
  })

  if(!validator.validate())
    return res.status(400).send(validator.errors().all())

  let reCaptchaRes = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaConfig.secretKey}&response=${req.body.recaptcha_response}`)
  if(!reCaptchaRes.data.success)
    return res.status(400).send({
      "recaptcha_response": [
          "The recaptcha response is invalid."
      ]
    })

  try{
    await transporter.sendMail({
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