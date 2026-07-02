import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError, ErrorCode } from '../../types/errors';
import { env } from '../../config/env';
import { registerUser, loginUser, refreshSession, revokeRefreshToken, getAuthUserById, requestOtp, resendOtp, verifyOtp } from './auth.service';
import type { RegisterRequestBody, LoginRequestBody, RequestOtpBody, ResendOtpBody, VerifyOtpBody } from './auth.validation';

function setRefreshCookie(res: Response, token: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/',
    expires,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie('refreshToken', { path: '/' });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RegisterRequestBody;
  const session = await registerUser(body);
  setRefreshCookie(res, session.refreshToken);
  return ApiResponse.created(res, { accessToken: session.accessToken, user: session.user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as LoginRequestBody;
  const session = await loginUser(body);
  setRefreshCookie(res, session.refreshToken);
  return ApiResponse.ok(res, { accessToken: session.accessToken, user: session.user });
});

export const requestOtpController = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RequestOtpBody;
  const result = await requestOtp(body.email);
  return ApiResponse.ok(res, result, 'OTP request processed');
});

export const resendOtpController = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as ResendOtpBody;
  const result = await resendOtp(body.email);
  return ApiResponse.ok(res, result, 'OTP resent successfully');
});

export const verifyOtpController = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as VerifyOtpBody;
  const session = await verifyOtp(body.email, body.otp);
  setRefreshCookie(res, session.refreshToken);
  return ApiResponse.ok(res, { accessToken: session.accessToken, user: session.user }, 'OTP verified successfully');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (token) await revokeRefreshToken(token);
  clearRefreshCookie(res);
  return ApiResponse.ok(res, {}, 'Logged out');
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) throw AppError.unauthorized('Refresh token missing', ErrorCode.REFRESH_TOKEN_INVALID);
  const session = await refreshSession(token);
  setRefreshCookie(res, session.refreshToken);
  return ApiResponse.ok(res, { accessToken: session.accessToken });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as unknown as { user?: { userId: string } }).user?.userId;
  if (!userId) throw AppError.unauthorized('Authentication required', ErrorCode.TOKEN_MISSING);
  const user = await getAuthUserById(userId);
  if (!user) throw AppError.notFound('User');
  return ApiResponse.ok(res, user);
});
