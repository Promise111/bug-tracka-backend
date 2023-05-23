const multer = require("multer");

exports.bugPics = multer({
  storage: multer.memoryStorage({}),
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg"
    ) {
      return cb(null, true);
    } else {
      console.log("shit");
      let error = new Error("Only .PNG, .JPG, and, .JPEG files allowed.");
      error.status = 400;
      cb(error, false);
    }
  },
  limits: { fileSize: process.env.MULTER_FILE_SIZE },
}).array("picture", 5);
