"use strict";
const express = require("express");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const IssueSchema = mongoose.Schema(
  {
    project: { type: String, required: true },
    issue_title: { type: String, default: "" },
    issue_text: { type: String, default: "" },
    created_on: { type: Date, required: true },
    updated_on: { type: Date, required: true },
    created_by: { type: String, default: "" },
    assigned_to: { type: String, default: "" },
    open: { type: Boolean, default: true },
    status_text: { type: String, default: "" },
  },
  { versionKey: false }
);
const Issue = mongoose.model("Issue", IssueSchema);
module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get((req, res) => {
      let query = {};
      Object.keys(req.query).forEach((field) => {
        if (req.query[field]) {
          query[field] = req.query[field];
        }
      });
      query.project = req.params.project;
      Issue.find(query)
        .select({ project: 0 })
        .exec((err, data) => {
          if (err) return res.json(err);
          res.json(data);
        });
    })

    .post(express.urlencoded({ extended: false }), (req, res) => {
      const project = req.params.project;
      const { assigned_to, status_text, issue_title, issue_text, created_by } =
        req.body;
      if (!issue_title || !issue_text || !created_by)
        return res.json({ error: "required field(s) missing" });
      let newIssue = new Issue({
        project,
        issue_title,
        issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by,
        assigned_to,
        status_text,
      });
      newIssue.save((err, data) => {
        if (err) return console.log(err);
        let { project, ...newData } = data["_doc"];
        res.json(newData);
      });
    })

    .put(express.urlencoded({ extended: false }), (req, res) => {
      const { assigned_to, status_text, issue_title, issue_text, created_by } =
        req.body;
      const open = req.body.open || true;
      if (!req.body["_id"]) return res.json({ error: "missing _id" });
      if (
        !assigned_to &&
        !status_text &&
        !issue_text &&
        !issue_title &&
        !created_by
      )
        return res.json({
          error: "no update field(s) sent",
          _id: req.body["_id"],
        });
      let body = {};
      Object.keys(body).forEach((field) => {
        if (req.body[field]) {
          body[field] = req.body[field];
        }
      });
      body["updated_on"] = new Date();
      Issue.findByIdAndUpdate(req.body["_id"], body, (err, data) => {
        if (err || !data)
          return res.json({
            error: "could not update",
            _id: req.body["_id"],
          });
        res.json({ result: "successfully updated", _id: req.body["_id"] });
      });
    })

    .delete(express.urlencoded({ extended: false }), (req, res) => {
      if (!req.body["_id"]) return res.json({ error: "missing _id" });
      Issue.findByIdAndRemove(req.body["_id"], (err, data) => {
        if (err || !data)
          return res.json({ error: "could not delete", _id: req.body["_id"] });
        res.json({ result: "successfully deleted", _id: req.body["_id"] });
      });
    });
};
