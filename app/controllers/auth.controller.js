const { validationResult } = require("express-validator");
const db = require("../models");
const argon = require("argon2");
const { ROLE } = require("../utils/const");

exports.adminSignUp = async (req, res, next) => {
  const errors = validationResult(req);
  const { first_name, last_name, email, password } = req.body;
  let emailExist;
  let roles;
  try {
    if (!errors.isEmpty()) {
      const validationErrors = [];
      for (const error of errors.array()) {
        validationErrors.push({ field: error.path, error: error.msg });
      }
      return res.status(400).json({
        status: "error",
        message: "Oops, something went wrong.",
        errors: validationErrors,
      });
    }

    let hashedPassword = await argon.hash(password);
    emailExist = await db.user
      .findOne()
      .where({ email: email.toLowerCase() })
      .lean();

    if (emailExist) {
      return res
        .status(400)
        .json({ status: "error", message: "User with email already exists" });
    }

    // const projection = {
    //   projection: { password: 0 },
    // };

    const {
      _id,
      createdAt,
      email: userEmail,
    } = await db.user.create({
      first_name,
      last_name,
      password: hashedPassword,
      email,
      role: ROLE[0],
    });

    res.status(201).json({
      status: "success",
      message: "signup successful",
      user: { _id, first_name, last_name, email: userEmail, createdAt },
    });
  } catch (error) {
    next(error);
  }
};

exports.userSignUp = async (req, res, next) => {
  const errors = validationResult(req);
  const { first_name, last_name, email, password } = req.body;
  let emailExist;
  let roles;
  try {
    if (!errors.isEmpty()) {
      const validationErrors = [];
      for (const error of errors.array()) {
        validationErrors.push({ field: error.path, error: error.msg });
      }
      return res.status(400).json({
        status: "error",
        message: "Oops, something went wrong.",
        errors: validationErrors,
      });
    }

    let hashedPassword = await argon.hash(password);
    emailExist = await db.user
      .findOne()
      .where({ email: email.toLowerCase() })
      .lean();

    if (emailExist) {
      return res
        .status(400)
        .json({ status: "error", message: "User with email already exists" });
    }

    const {
      _id,
      createdAt,
      email: userEmail,
    } = await db.user.create({
      first_name,
      last_name,
      password: hashedPassword,
      email,
      role: ROLE[1],
    });

    res.status(201).json({
      status: "success",
      message: "signup successful",
      user: { _id, first_name, last_name, email: userEmail, createdAt },
    });
  } catch (error) {
    next(error);
  }
};

exports.signin = async (req, res, next) => {
  const errors = validationResult(req);
  const { email, password } = req.body;
  let verifyPassword;
  try {
    if (!errors.isEmpty()) {
      const validationErrors = [];
      for (const error of errors.array()) {
        validationErrors.push({ field: error.path, error: error.msg });
      }
      return res.status(400).json({
        status: "error",
        message: "Oops, something went wrong.",
        errors: validationErrors,
      });
    }
    const user = await db.user.findOne().where({ email }).select("+password");
    // .select("+password -first_name");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email and password",
        data: null,
      });
    }

    verifyPassword = await argon.verify(user?.password, password);

    if (!verifyPassword) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email and password",
        data: null,
      });
    }

    res.status(200).json({
      status: "success",
      message: "signin successful",
      access_token: user.generateAuthToken(),
      user: {
        first_name: user?.first_name,
        last_name: user?.last_name,
        email: user?.email,
        role: user?.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  const errors = validationResult(req);
  const { first_name, last_name, email, password } = req.body;
  let emailExist;
  try {
    if (!errors.isEmpty()) {
      const validationErrors = [];
      for (const error of errors.array()) {
        validationErrors.push({ field: error.path, error: error.msg });
      }
      return res.status(400).json({
        status: "error",
        message: "Oops, something went wrong.",
        errors: validationErrors,
      });
    }
    
    let hashedPassword = await argon.hash(password);
    emailExist = await db.user
      .findOne()
      .where({ email: email.toLowerCase() })
      .lean();

    if (emailExist) {
      return res
        .status(400)
        .json({ status: "error", message: "User with email already exists" });
    }

    const {
      _id,
      createdAt,
      email: userEmail,
    } = await db.user.create({
      first_name,
      last_name,
      password: hashedPassword,
      email,
      role: ROLE[1],
    });

    res.status(201).json({
      status: "success",
      message: "signup successful",
      user: { _id, first_name, last_name, email: userEmail, createdAt },
    });
  } catch (error) {
    next(error);
  }
};
