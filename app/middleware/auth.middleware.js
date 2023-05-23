const { verify } = require("jsonwebtoken");
const { ROLE } = require("../utils/const");

exports.authMiddleware = (req, res, next) => {
  const authHeader = req?.header("authorization");
  const token = authHeader ? authHeader.split(" ")[1] : "";
  try {
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access denied. No token provided.",
      });
    }
    const decoded = verify(token, process.env.JWT_PRIVATE_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.message === "jwt expired") {
      error.status = 400;
      error.message = "Access denied. Token has expired.";
      return next(error);
    }
    if (
      error.message === "jwt malformed" ||
      error.message == "invalid signature" ||
      error.message === "invalid token"
    ) {
      error.status = 400;
      error.message = `Access denied. ${error.message}.`;
      return next(error);
    }
    next(error);
  }
};

exports.isSupport = (req, res, next) => {
  const { role } = req.user;
  try {
    if (role === ROLE[0]) {
      return next();
    }

    res.status(403).json({
      status: "error",
      message: "You do not possess the permission to access this resource",
    });
  } catch (error) {
    next(error);
  }
};

exports.isEndUser = (req, res, next) => {
  const { role } = req.user;
  try {
    if (role === ROLE[1]) {
      return next();
    }

    res.status(403).json({
      status: "error",
      message: "You do not possess the permission to access this resource",
    });
  } catch (error) {
    next(error);
  }
};
