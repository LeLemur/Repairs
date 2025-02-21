// middlewares/errorHandler.js – Global error handling middleware
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
};
