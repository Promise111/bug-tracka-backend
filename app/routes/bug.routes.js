module.exports = (app) => {
  const router = require("express").Router();
  const bugController = require("../controllers/bug.controller");
  const { body } = require("express-validator");
  const {
    authMiddleware,
    isEndUser,
    isSupport,
  } = require("../middleware/auth.middleware");
  const { PRIORITY, STATUS } = require("../utils/const");
  const { bugPics } = require("../middleware/multer");

  router.get("/bug/:id", [authMiddleware], bugController.getDefect);

  router.get("/bugs", [authMiddleware], bugController.getDefects);

  router.post(
    "/bug/raise",
    [
      bugPics,
      authMiddleware,
      isEndUser,
      body("issue_name")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Issue name is required"),
      body("description")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Description is required"),
      body("priority")
        .trim()
        .custom((value) => {
          if (!value || value === undefined) {
            return Promise.reject("Priority required");
          }

          if (!PRIORITY.includes(value)) {
            return Promise.reject(
              `Enter valid role, ${PRIORITY.slice(0, PRIORITY.length - 1).join(
                " "
              )}, and ${PRIORITY[PRIORITY.length - 1]}`
            );
          }

          return true;
        }),
    ],
    bugController.raiseDefect
  );

  router.delete(
    "/bug/images/:id",
    [
      authMiddleware,
      isEndUser,
      body("imagesUrl")
        .not()
        .isEmpty()
        .withMessage("imagesUrl must be an array and is required")
        .isArray(),
      body("imagesUrl.*")
        .isURL()
        .withMessage("imagesUrl must contain valid URLs"),
    ],
    bugController.deleteBugImages
  );

  router.delete(
    "/bug/:id",
    [authMiddleware, isEndUser],
    bugController.deleteDefect
  );

  router.put(
    "/bug/:id",
    [
      bugPics,
      authMiddleware,
      isEndUser,
      body("issue_name"),
      body("description"),
      body("priority").custom((value) => {
        if (value && !PRIORITY.includes(value)) {
          return Promise.reject(
            `Enter valid role, ${PRIORITY.slice(0, PRIORITY.length - 1).join(
              " "
            )}, and ${PRIORITY[PRIORITY.length - 1]}`
          );
        }

        return true;
      }),
    ],
    bugController.alterDefect
  );

  router.put(
    "/bug/status/:id",
    [
      authMiddleware,
      isSupport,
      body("status")
        .trim()
        .custom((value) => {
          if (!value || value === undefined) {
            return Promise.reject("Priority required");
          }

          if (!STATUS.includes(value)) {
            return Promise.reject(
              `Enter valid role, ${STATUS.slice(0, STATUS.length - 1).join(
                ", "
              )}, and ${STATUS[STATUS.length - 1]}`
            );
          }

          return true;
        }),
    ],
    bugController.supportUpdatePriority
  );

  app.use("/api", router);
};
