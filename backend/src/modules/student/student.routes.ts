import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/authenticate.middleware';
import { createStudentSchema, updateStudentSchema, studentIdParam } from './student.validation';
import { create, findAll, findOne, update, remove } from './student.controller';

const router = Router();

router.use(authenticate);
router.post('/', validate(createStudentSchema, 'body'), create);
router.get('/', findAll);
router.get('/:id', validate(studentIdParam, 'params'), findOne);
router.patch('/:id', validate(studentIdParam, 'params'), validate(updateStudentSchema, 'body'), update);
router.delete('/:id', validate(studentIdParam, 'params'), remove);

export default router;
