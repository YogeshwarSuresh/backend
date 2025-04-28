const multer = require('multer');

// Error handling middleware for file uploads
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File size is too large. Maximum 5MB allowed.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field. Make sure the field name is "image".'
      });
    }
    // Handle other Multer errors
    return res.status(400).json({
      error: `File upload error: ${err.message}`
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(500).json({
      error: `File upload error: ${err.message}`
    });
  }

  // If no error, continue to next middleware
  next();
};

module.exports = uploadErrorHandler;