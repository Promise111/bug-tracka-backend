module.exports = (app) => {
  const router = require("express").Router();
  const { body } = require("express-validator");
  const authController = require("../controllers/auth.controller");
  const {
    authMiddleware,
    isSupport,
  } = require("../middleware/auth.middleware");
  const { ROLE } = require("../utils/const");

  router.post(
    "/admin/signup",
    [
      body("first_name")
        .trim()
        .not()
        .isEmpty()
        .withMessage("first name is required"),
      body("last_name")
        .trim()
        .not()
        .isEmpty()
        .withMessage("last name is required"),
      body("email").trim().isEmail().withMessage("enter valid email address"),
      body("password")
        .trim()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
          "i"
        )
        .withMessage(
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
        ),
      body("confirmPassword").custom((value, { req }) => {
        if (!value || value === undefined) {
          return Promise.reject("confirmPassword is required");
        }
        if (value !== req.body.password)
          return Promise.reject(
            "password and confirmPassword do not make a match"
          );

        return true;
      }),
    ],
    authController.adminSignUp
  );

  router.post(
    "/signup",
    [
      body("first_name")
        .trim()
        .not()
        .isEmpty()
        .withMessage("first name is required"),
      body("last_name")
        .trim()
        .not()
        .isEmpty()
        .withMessage("last name is required"),
      body("email").trim().isEmail().withMessage("enter valid email address"),
      body("email").trim().isEmail().withMessage("enter valid email address"),
      body("password")
        .trim()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
          "i"
        )
        .withMessage(
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
        ),
      body("confirmPassword").custom((value, { req }) => {
        if (!value || value === undefined) {
          return Promise.reject("confirmPassword is required");
        }
        if (value !== req.body.password)
          return Promise.reject(
            "password and confirmPassword do not make a match"
          );

        return true;
      }),
    ],
    authController.userSignUp
  );

  router.post(
    "/signin",
    [
      body("email").trim().isEmail().withMessage("Enter valid email"),
      body("password")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Enter valid password"),
    ],
    authController.signin
  );

  router.post(
    "/create",
    [
      authMiddleware,
      isSupport,
      body("first_name")
        .trim()
        .not()
        .isEmpty()
        .withMessage("first name is required"),
      body("last_name")
        .trim()
        .not()
        .isEmpty()
        .withMessage("last name is required"),
      body("role")
        .trim()
        .custom((value) => {
          if (!value || value == undefined) {
            return Promise.reject("role is required");
          }

          if (!ROLE.includes(value)) {
            return Promise.reject(
              `Enter valid role, ${ROLE.slice(0, ROLE.length - 1).join(
                " "
              )}, and ${ROLE[ROLE.length - 1]}`
            );
          }

          return true;
        }),
      body("email").trim().isEmail().withMessage("enter valid email address"),
      body("password")
        .trim()
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
          "i"
        )
        .withMessage(
          "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
        ),
      body("confirmPassword").custom((value, { req }) => {
        if (!value || value === undefined) {
          return Promise.reject("confirmPassword is required");
        }
        if (value !== req.body.password)
          return Promise.reject(
            "password and confirmPassword do not make a match"
          );

        return true;
      }),
    ],
    authController.createUser
  );

  app.use("/api/auth", router);
};
