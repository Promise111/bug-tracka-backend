const handleError = function (error, req, res, next) {
  console.log(error);
  if (error.status !== 500) {
    return res
      .status(error.status)
      .json({ status: "error", message: error.message, data: error });
  }

  return res.status(500).json({
    status: "error",
    message: "Oops, something went wrong",
    data: error,
  });
};

module.exports = handleError;
