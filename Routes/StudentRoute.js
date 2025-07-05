import express from 'express';
import {
  createStudent,
  deleteStudent,
  getResult,
  getStudent,
  getStudents,
  resultSet,
  updateStudent
} from '../Controller/StudentController.js';

import { Upload } from '../Middleware/upload.js'; // Multer-based file upload middleware
import { body } from 'express-validator'; // For request validation

const router = express.Router();

/**
 * @route   GET /
 * @desc    Get all students
 */
router.get('/', getStudents);

/**
 * @route   POST /single
 * @desc    Get a single student by body (likely via ID or filter)
 */
router.post('/single', getStudent);

/**
 * @route   PUT /:id
 * @desc    Update student info including profilePic, signature, sheetCopy
 * @access  Protected by secretKey validation
 */
router.put(
  '/:id',
  Upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'sheetCopy', maxCount: 1 }
  ]),
  [
    body('secretKey')
      .notEmpty().withMessage('Secret Key is required')
      .equals('123456').withMessage('Secret Key is incorrect'),

    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
  ],
  updateStudent
);

/**
 * @route   GET /result/:rollNo
 * @desc    Get student result by roll number
 */
router.get('/result/:rollNo', getResult);

/**
 * @route   PUT /result/:rollNo
 * @desc    Update student result by roll number
 */
router.put('/result/:rollNo', resultSet);

/**
 * @route   DELETE /:id/:secretKey
 * @desc    Delete student using ID and secretKey as params
 */
router.delete('/:id/:secretKey', deleteStudent);

/**
 * @route   POST /create
 * @desc    Create new student with profilePic, signature, and sheetCopy
 * @access  Protected by secretKey validation
 */
router.post(
  '/create',
  Upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'sheetCopy', maxCount: 1 }
  ]),
  [
    body('secretKey')
      .notEmpty().withMessage('SecretKey is required')
      .equals('123456').withMessage('SecretKey is incorrect'),

    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
  ],
  createStudent
);

export default router;