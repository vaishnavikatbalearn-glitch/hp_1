import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { registerSchema, loginSchema, requestOtpSchema, resendOtpSchema, verifyOtpSchema } from './auth.validation';
import { register, login, logout, refresh, me, requestOtpController, resendOtpController, verifyOtpController } from './auth.controller';
import { authenticate } from './auth.middleware';

const router = Router();

router.post('/register', validate(registerSchema, 'body'), register);
router.post('/login', validate(loginSchema, 'body'), login);
router.post('/request-otp', validate(requestOtpSchema, 'body'), requestOtpController);
router.post('/resend-otp', validate(resendOtpSchema, 'body'), resendOtpController);
router.post('/verify-otp', validate(verifyOtpSchema, 'body'), verifyOtpController);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', authenticate, me);

export default router;
