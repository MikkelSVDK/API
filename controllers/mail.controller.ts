import { Request, Response, NextFunction } from 'express'
import { make } from 'simple-body-validator'
import nodemailer from 'nodemailer'
import axios from 'axios'

import mailConfig from '@config/mail.config.json'
import recaptchaConfig from '@config/recaptcha.config.json'

let transporter = nodemailer.createTransport(mailConfig)

export async function store(req: Request, res: Response, next: NextFunction): Promise<void> {
  const validator = make(req.body, {
    recaptcha_response: 'required',
    name: 'required|string|min:3|max:64',
    email: 'required|email',
    message: 'required|string'
  })

  try {
    if(!validator.validate())
      throw validator.errors().all()
    
    let reCaptchaRes = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaConfig.secretKey}&response=${req.body.recaptcha_response}`)
    if(!reCaptchaRes.data.success)
      throw {
        "recaptcha_response": [
            "The recaptcha response is invalid."
        ]
      }

    await transporter.sendMail({
      to: "mikkel@mikkelsv.dk",
      replyTo: `"${req.body.name}" <${req.body.email}>`,
      subject: "Enquiry via website",
      text: req.body.message,
    })

    res.send({ success: true })
  } catch (err) {
    res.status(400).send({ success: false, errors: err })
  }
}