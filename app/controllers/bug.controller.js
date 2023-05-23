const { validationResult } = require("express-validator");
const db = require("../models");
const { ObjectId } = require("mongoose").Types;
const { PRIORITY, STATUS } = require("../utils/const");
const cloudinary = require("../utils/cloudinary");
const path = require("path");

exports.getDefect = async (req, res, next) => {
  const { id } = req.params;
  try {
    const data = await db.bug.findById(id).populate({
      path: "reporter",
      select: ["email", "first_name", "last_name"],
    });
    res.status(200).json({ status: "success", data });
  } catch (error) {
    next(error);
  }
};

exports.getDefects = async (req, res, next) => {
  const page = req.query.page || 1;
  const limit = process.env.PAGINATION || 10;
  try {
    const data = await db.bug
      .find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate({
        path: "reporter",
        select: ["email", "first_name", "last_name"],
      });

    const count = await db.bug.count();
    res.status(200).json({ status: "success", data, count });
  } catch (error) {
    next(error);
  }
};

exports.raiseDefect = async (req, res, next) => {
  const { _id } = req.user;
  const errors = validationResult(req);
  const body = req.body;
  const status = "pendings";
  let issue;
  let user;
  const files = req.files;
  const imageUrlList = [];
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
    for (let file of files) {
      const b64 = Buffer.from(file.buffer).toString("base64");
      let dataURI = "data:" + file.mimetype + ";base64," + b64;
      const { secure_url } = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
      });
      imageUrlList.push(secure_url);
    }
    // return res.status(200).json({ files, body, imageUrlList });

    issue = await db.bug.create({
      ...body,
      reporter: _id,
      pics_url: imageUrlList,
    });

    user = await db.user.findByIdAndUpdate(_id, { $push: { bugs: issue._id } });

    res.status(201).json({
      status: "success",
      message: "Issue raised successfully",
      data: issue,
      // ...req.body,
    });
  } catch (error) {
    next(error);
  }
};

exports.alterDefect = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const body = req.body;
  const errors = validationResult(req);
  const files = req.files;
  const imageUrlList = [];
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
    // console.log(body, files);

    let issue = await db.bug.findById(id);

    if (!issue) {
      return res
        .status(404)
        .json({ message: "unsuccessful", message: "Bug not found" });
    }

    const isUserReporter = issue.reporter.valueOf() === user._id;

    if (!isUserReporter) {
      return res.status(401).json({
        status: "unsuccessful",
        message: "Only authors can alter their bug reports",
      });
    }

    if (files.length > 0) {
      for (let file of files) {
        const b64 = Buffer.from(file.buffer).toString("base64");
        let dataURI = "data:" + file.mimetype + ";base64," + b64;
        const { secure_url } = await cloudinary.uploader.upload(dataURI, {
          resource_type: "auto",
        });
        imageUrlList.push(secure_url);
      }
    }

    if (imageUrlList.length == 0) {
      issue = await db.bug.findByIdAndUpdate(id, body, { new: true });
    } else {
      issue = await db.bug.findByIdAndUpdate(
        id,
        { ...body, $push: { pics_url: { $each: imageUrlList } } },
        { new: true }
      );
    }

    res.status(200).json({
      status: "success",
      message: "Bug updated successfully",
      // data: { _id: id, ...body },
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteDefect = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  let cloudinaryResponse;
  try {
    const issue = await db.bug.findById(id);

    if (!issue) {
      return res
        .status(404)
        .json({ message: "unsuccessful", message: "Bug not found" });
    }

    const isUserReporter = issue.reporter.valueOf() === user._id;
    if (!isUserReporter) {
      return res.status(401).json({
        status: "unsuccessful",
        message: "Only an author can delete their bug report",
      });
    }

    if (issue?.pics_url.length > 0) {
      const public_ids = [];
      for (let url of issue?.pics_url) {
        public_ids.push(path.basename(url).split(".")[0]);
      }
      cloudinaryResponse = await cloudinary.api.delete_resources(public_ids, {
        resource_type: "image",
        type: "upload",
      });
    }

    // delete issue
    await issue.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Bug deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.supportUpdatePriority = async (req, res, next) => {
  const { id } = req.params;
  const body = req.body;
  const errors = validationResult(req);
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
    const issue = await db.bug.findById(id);

    if (!issue) {
      return res
        .status(404)
        .json({ message: "unsuccessful", message: "Bug not found" });
    }

    if (body.status === STATUS[2] && issue.status === STATUS[0]) {
      return res.status(400).json({
        status: "unsuccessful",
        message:
          "status must be entered accordinly, pending, in-progress and resolved",
        data: issue,
      });
    }

    if (body.status === STATUS[0] && issue.status === STATUS[0]) {
      return res.status(400).json({
        status: "unsuccessful",
        message: "status already is pending",
        data: issue,
      });
    }

    let updatedIssue = await db.bug.findByIdAndUpdate(
      id,
      { status: body?.status },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Bug updated successfully",
      data: updatedIssue,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteBugImages = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const errors = validationResult(req);
  const { imagesUrl } = req.body;
  let issue;
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
    issue = await db.bug.findById(id);

    if (!issue) {
      return res
        .status(404)
        .json({ message: "unsuccessful", message: "Bug not found" });
    }

    const isUserReporter = issue.reporter.valueOf() === user._id;
    if (!isUserReporter) {
      return res.status(401).json({
        status: "unsuccessful",
        message: "Only an author can alter their bug report",
      });
    }

    const public_ids = [];

    for (const url of imagesUrl) {
      public_ids.push(path.basename(url).split(".")[0]);
    }
    await cloudinary.api.delete_resources(public_ids, {
      resource_type: "image",
      type: "upload",
    });

    issue = await db.bug.findByIdAndUpdate(
      id,
      {
        $pull: { pics_url: { $in: imagesUrl } },
      },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      message: `Bug image${
        imagesUrl.length > 1 ? "s" : ""
      } deleted successfully`,
      issue,
    });
  } catch (error) {
    next(error);
  }
};
