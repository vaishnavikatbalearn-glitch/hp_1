import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { env } from '../config/env';

// ─── Future Module Routers ────────────────────────────────────────────────────
// Import and mount as modules are built:
import authRouter from '../modules/auth/auth.routes';
import leaveRouter from '../modules/leave/leave.routes';
import complaintRouter from '../modules/complaints/complaint.routes';
import visitorRouter from '../modules/visitors/visitor.routes';
import laundryRouter from '../modules/laundry/laundry.routes';
import attendanceRouter from '../modules/attendance/attendance.routes';
import feesRouter from '../modules/fees/fees.routes';
import notificationRouter from '../modules/notification/notification.routes';
import studentRouter from '../modules/student/student.routes';
import roomsRouter from '../modules/rooms/rooms.routes';
// import userRouter from '../modules/user/user.routes';
// etc.

const v1Router = Router();

// ── Health / Ping ─────────────────────────────────────────────────────────────
v1Router.get('/health', (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: `${env.APP_NAME} API is healthy`,
    version: env.API_VERSION,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Module Routes (add as you build each module) ──────────────────────────────
v1Router.use('/auth', authRouter);
v1Router.use('/leave', leaveRouter);
v1Router.use('/complaints', complaintRouter);
v1Router.use('/visitors', visitorRouter);
v1Router.use('/visitor', visitorRouter);
v1Router.use('/laundry', laundryRouter);
v1Router.use('/attendance', attendanceRouter);
v1Router.use('/fees', feesRouter);
v1Router.use('/notifications', notificationRouter);
v1Router.use('/student', studentRouter);
v1Router.use('/rooms', roomsRouter);
// v1Router.use('/users', userRouter);
// v1Router.use('/hostels', hostelRouter);
// v1Router.use('/fees', feesRouter);
// v1Router.use('/fines', finesRouter);
// v1Router.use('/maintenance', maintenanceRouter);
// v1Router.use('/notices', noticeRouter);
// v1Router.use('/visitors', visitorRouter);
// v1Router.use('/complaints', complaintRouter);
// v1Router.use('/events', eventRouter);
// v1Router.use('/reports', reportRouter);
// v1Router.use('/notifications', notificationRouter);

export default v1Router;
