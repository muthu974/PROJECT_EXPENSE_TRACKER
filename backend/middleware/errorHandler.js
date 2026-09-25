const errorHandler = (err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred'
  });
};

module.exports = errorHandler;
