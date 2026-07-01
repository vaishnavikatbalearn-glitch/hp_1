import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.middleware';
import { validate, schemas } from '../../middleware/validate.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { submitComplaint, myComplaints, listComplaints, patchComplaint } from './complaint.controller';
import { complaintTimeline } from './complaint.controller';
import { createComplaintSchema, updateComplaintSchema } from './complaint.validation';

const router = Router();

// Student creates complaint
router.post('/', authenticate, requirePermission('complaint:create'), validate(createComplaintSchema, 'body'), submitComplaint);

// Student views their complaints
router.get('/my', authenticate, requirePermission('complaint:read'), myComplaints);

// Admin/Warden list all complaints
router.get('/', authenticate, requirePermission('complaint:read'), listComplaints);

// Admin/Warden update complaint
router.patch('/:id', authenticate, requirePermission('complaint:update'), validate(schemas.idParam, 'params'), validate(updateComplaintSchema, 'body'), patchComplaint);

// Complaint timeline
router.get('/:id/timeline', authenticate, requirePermission('complaint:read'), validate(schemas.idParam, 'params'), complaintTimeline);

export default router;
