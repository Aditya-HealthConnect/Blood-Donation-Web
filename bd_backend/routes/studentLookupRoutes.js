const express = require('express');

const router = express.Router();

const STUDENT_API_BASE = 'https://api.maya.adityauniversity.in/node/api/get-user-by-roll-no-coding-profiles';

router.get('/api/student-lookup/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    const response = await fetch(`${STUDENT_API_BASE}/${encodeURIComponent(rollNo)}`);

    if (!response.ok) {
      return res.status(404).json({ success: false, message: 'Roll number not found' });
    }

    const data = await response.json();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Student lookup error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch student details' });
  }
});

module.exports = router;
