import express from 'express'

const router = express.Router()

import { store } from "@controllers/mail.controller"

router.post('/mail', store)

export default router