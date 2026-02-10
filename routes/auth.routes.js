import express from 'express'
import { initiateSignup } from '../controllers/auth.controller.js';
const router = express.Router()

router.post('/initiate-signup', initiateSignup);

export default router;
