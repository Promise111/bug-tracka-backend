const { ROLE } = require("../utils/const");
const jwt = require("jsonwebtoken");

const User = (mongoose) => {
  const schema = mongoose.Schema(
    {
      first_name: { type: String, required: true },
      last_name: { type: String, required: true },
      email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
      },
      role: { type: String, enum: ROLE },
      password: { type: String, select: false, trim: true, required: true },
      bugs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bug" }],
    },
    { timestamps: true }
  );

  /** generates json web token with user data as payload */
  schema.methods.generateAuthToken = function () {
    return jwt.sign(
      {
        _id: this._id,
        first_name: this.first_name,
        last_name: this.last_name,
        email: this.email,
        role: this.role,
      },
      process.env.JWT_PRIVATE_KEY,
      { expiresIn: "4h" }
    );
  };
  const User = mongoose.model("User", schema);
  return User;
};

module.exports = User;
