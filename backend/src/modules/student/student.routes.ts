import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/authenticate.middleware';
import { upload } from '../../utils/upload';
import {
  createStudentSchema,
  updateStudentSchema,
  studentIdParam,
  studentParentLinkSchema,
  studentParentUpdateSchema,
  studentIdWithParentIdParam,
  studentDocumentUploadSchema,
} from './student.validation';
import {
  create,
  findAll,
  findOne,
  getParents,
  linkParent,
  updateParentLink,
  removeParentLink,
  update,
  suspend,
  activate,
  remove,
  uploadDocument,
} from './student.controller';

const router = Router();

router.use(authenticate);
router.post('/', validate(createStudentSchema, 'body'), create);
router.get('/', findAll);
router.get('/:id', validate(studentIdParam, 'params'), findOne);
router.get('/:id/parents', validate(studentIdParam, 'params'), getParents);
router.post('/:id/parent', validate(studentIdParam, 'params'), validate(studentParentLinkSchema, 'body'), linkParent);
router.patch('/:id/parent', validate(studentIdParam, 'params'), validate(studentParentUpdateSchema, 'body'), updateParentLink);
router.delete('/:id/parent/:parentId', validate(studentIdWithParentIdParam, 'params'), removeParentLink);
router.patch('/:id', validate(studentIdParam, 'params'), validate(updateStudentSchema, 'body'), update);
router.patch('/:id/suspend', validate(studentIdParam, 'params'), suspend);
router.patch('/:id/activate', validate(studentIdParam, 'params'), activate);
router.post('/:id/documents', validate(studentIdParam, 'params'), validate(studentDocumentUploadSchema, 'body'), upload.single('file'), uploadDocument);
router.delete('/:id', validate(studentIdParam, 'params'), remove);

export default router;
