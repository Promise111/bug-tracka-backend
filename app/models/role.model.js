module.exports = (mongoose) => {
  const Role = mongoose.model(
    "Role",
    mongoose.Schema(
      { name: { type: String, unique: true, required: true } },
      { timestamps: true }
    )
  );
  return Role;
};
