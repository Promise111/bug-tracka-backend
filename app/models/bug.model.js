const { PRIORITY, STATUS } = require("../utils/const");
const Bug = (mongoose) => {
  const Bug = mongoose.model(
    "Bug",
    mongoose.Schema({
      issue_name: { type: String, required: true },
      description: { type: String, required: true },
      status: {
        type: String,
        default: "pending",
        enum: STATUS,
        lowercase: true,
      },
      reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      pics_url: { type: [String], required: false },
      priority: {
        type: String,
        enum: PRIORITY,
        required: true,
        lowercase: true,
      },
    })
  );
  return Bug;
};

module.exports = Bug;
