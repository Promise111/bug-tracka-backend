const rateLimiter = require("express-rate-limit");

const limiter = rateLimiter({
  windowMs: 1000, // 1 sec => milliseconds
  max: 30, // Limit each IP to 30 requests per `window` (here, per 1 sec)
  message: "You have exceeded the 30 requests in 1s limit!",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
});

module.exports = limiter;
