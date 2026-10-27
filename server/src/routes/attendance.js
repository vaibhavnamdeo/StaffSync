const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getAttendance
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.post('/clock-in', protect, clockIn);
router.post('/clock-out', protect, clockOut);
router.get('/', protect, getAttendance);

module.exports = router;
