module.exports = (err, req, res, next) => {
  console.error(err.stack);
  const isProd = process.env.NODE_ENV === "production";
  res
    .status(500)
    .json({ success: false, message: isProd ? "Server error" : err.message });
};
