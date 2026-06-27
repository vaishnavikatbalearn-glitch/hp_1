import { Prisma, PaymentMethod, PaymentStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../types/errors';
import { paymentCreateSchema, paymentUpdateSchema } from './fees.validation';
import { z } from 'zod';

type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
type PaymentUpdateInput = z.infer<typeof paymentUpdateSchema>;

function toPaymentStatus(amount: Prisma.Decimal, total: Prisma.Decimal): PaymentStatus {
  if (amount.gte(total)) {
    return PaymentStatus.PAID;
  }

  if (amount.gt(0)) {
    return PaymentStatus.PARTIAL;
  }

  return PaymentStatus.PENDING;
}

export async function listStudentFees(studentId: string) {
  return prisma.feeRecord.findMany({
    where: { studentId },
    orderBy: { dueDate: 'asc' },
    include: {
      student: {
        select: {
          id: true,
          enrollmentNumber: true,
          firstName: true,
          lastName: true,
        },
      },
      payments: {
        orderBy: { paidAt: 'desc' },
      },
    },
  });
}

export async function listStudentFeeHistory(studentId: string) {
  return prisma.feeRecord.findMany({
    where: { studentId },
    orderBy: { dueDate: 'desc' },
    include: {
      student: {
        select: {
          id: true,
          enrollmentNumber: true,
          firstName: true,
          lastName: true,
        },
      },
      payments: {
        orderBy: { paidAt: 'desc' },
      },
    },
  });
}

export async function listPendingFees() {
  return prisma.feeRecord.findMany({
    where: {
      status: {
        in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL, PaymentStatus.OVERDUE],
      },
    },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    include: {
      student: {
        select: {
          id: true,
          enrollmentNumber: true,
          firstName: true,
          lastName: true,
        },
      },
      payments: {
        orderBy: { paidAt: 'desc' },
      },
    },
  });
}

export async function createFeePayment(input: PaymentCreateInput, collectedBy: string) {
  const feeRecord = await prisma.feeRecord.findUnique({
    where: { id: input.feeRecordId },
  });

  if (!feeRecord) {
    throw AppError.notFound('Fee record');
  }

  const existingReceipt = await prisma.payment.findUnique({
    where: { receiptNumber: input.receiptNumber },
  });

  if (existingReceipt) {
    throw AppError.conflict('Receipt number already exists');
  }

  const amount = new Prisma.Decimal(input.amount);
  const remaining = feeRecord.amount.minus(feeRecord.paidAmount);

  if (amount.gt(remaining)) {
    throw AppError.badRequest('Payment amount cannot exceed the remaining balance');
  }

  const nextPaidAmount = feeRecord.paidAmount.add(amount);
  const nextStatus = toPaymentStatus(nextPaidAmount, feeRecord.amount);

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        feeRecordId: feeRecord.id,
        amount,
        method: input.method as PaymentMethod,
        transactionId: input.transactionId ?? null,
        receiptNumber: input.receiptNumber,
        notes: input.notes ?? null,
        collectedBy,
      },
    });

    await tx.feeRecord.update({
      where: { id: feeRecord.id },
      data: {
        paidAmount: nextPaidAmount,
        status: nextStatus,
      },
    });

    return payment;
  });
}

export async function updateFeePayment(paymentId: string, input: PaymentUpdateInput, collectedBy: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { feeRecord: true },
  });

  if (!payment) {
    throw AppError.notFound('Payment');
  }

  if (input.receiptNumber) {
    const receiptExists = await prisma.payment.findFirst({
      where: {
        receiptNumber: input.receiptNumber,
        NOT: { id: paymentId },
      },
    });

    if (receiptExists) {
      throw AppError.conflict('Receipt number already exists');
    }
  }

  const oldAmount = payment.amount;
  const nextAmount = input.amount !== undefined ? new Prisma.Decimal(input.amount) : oldAmount;
  const amountDelta = nextAmount.minus(oldAmount);
  const nextPaidAmount = payment.feeRecord.paidAmount.add(amountDelta);

  if (nextPaidAmount.gt(payment.feeRecord.amount)) {
    throw AppError.badRequest('Updated payment amount would exceed the fee record amount');
  }

  const nextStatus = toPaymentStatus(nextPaidAmount, payment.feeRecord.amount);

  return prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        amount: nextAmount,
        method: input.method ? (input.method as PaymentMethod) : payment.method,
        transactionId: input.transactionId ?? payment.transactionId,
        receiptNumber: input.receiptNumber ?? payment.receiptNumber,
        notes: input.notes ?? payment.notes,
        collectedBy,
      },
    });

    await tx.feeRecord.update({
      where: { id: payment.feeRecordId },
      data: {
        paidAmount: nextPaidAmount,
        status: nextStatus,
      },
    });

    return updatedPayment;
  });
}
