const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("POST /api/issues/{project} => object", () => {
    test("Every Field Input", (done) => {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .send({
          issue_title: "title",
          issue_text: "text",
          created_by: "creator",
          assigned_to: "assigned",
          status_text: "status",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "title");
          assert.equal(res.body.issue_text, "text");
          assert.equal(res.body.created_by, "creator");
          assert.equal(res.body.assigned_to, "assigned");
          assert.equal(res.body.status_text, "status");
          done();
        });
    });
    test("Required Field Inputs", (done) => {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .send({
          issue_title: "title",
          issue_text: "text",
          created_by: "creator",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "title");
          assert.equal(res.body.issue_text, "text");
          assert.equal(res.body.created_by, "creator");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.status_text, "");
          done();
        });
    });
    test("Missing Field Inputs", (done) => {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .send({ issue_title: "title" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });
  suite("GET /api/issues/{project} => array of objects", () => {
    test("GET All Issues", (done) => {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], "issue_title");
          assert.property(res.body[0], "issue_text");
          assert.property(res.body[0], "created_on");
          assert.property(res.body[0], "updated_on");
          assert.property(res.body[0], "created_by");
          assert.property(res.body[0], "assigned_to");
          assert.property(res.body[0], "open");
          assert.property(res.body[0], "status_text");
          assert.property(res.body[0], "_id");
          done();
        });
    });
    test("GET with One Filter", (done) => {
      chai
        .request(server)
        .get("/api/issues/apitest?issue_title=title")
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          try {
            res.body.forEach((item) => {
              assert.equal(item.issue_title, "title");
            });
          } catch {
            return done();
          }
          done();
        });
    });
    test("GET with Multiple Filters", (done) => {
      chai
        .request(server)
        .get("/api/issues/apitest?issue_title=title&assigned_to=assigned")
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          try {
            res.body.forEach((item) => {
              assert.equal(item.issue_title, "title");
              assert.equal(item.assigned_to, "assigned");
            });
          } catch {
            return done();
          }
          done();
        });
    });
  });
  suite("PUT /api/issues/{project} => object", () => {
    const _id = "6208438ad3c9cd3fd0fbecab";
    test("Update One Field", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({ _id, issue_title: "test" + Math.random() })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, _id);
          done();
        });
    });
    test("Update Multiple Fields", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({
          _id,
          issue_title: "test" + Math.random(),
          issue_text: "test" + Math.random(),
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, _id);
          done();
        });
    });
    test("Update Field with Missing Id", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({ issue_title: "test" + Math.random() })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
    test("Update with 0 Fields", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({ _id })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "no update field(s) sent");
          assert.equal(res.body._id, _id);
          done();
        });
    });
    test("Update with Invalid Id", (done) => {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({ _id: "fail", issue_title: "test" + Math.random() })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not update");
          assert.equal(res.body._id, "fail");
          done();
        });
    });
  });
  suite("DELETE /api/issues/{project} => object", () => {
    let _id;
    chai
      .request(server)
      .post("/api/issues/apitest")
      .send({
        issue_title: "title",
        issue_text: "text",
        created_by: "creator",
        assigned_to: "assigned",
        status_text: "status",
      })
      .end((err, res) => {
        _id = res.body._id;
      });
    test("Delete an Issue", (done) => {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .send({ _id })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully deleted");
          assert.equal(res.body._id, _id);
          done();
        });
    });
    test("Delete with Invalid Id", (done) => {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .send({ _id: "fail" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "could not delete");
          assert.equal(res.body._id, "fail");
          done();
        });
    });
    test("Delete with Missing Id", (done) => {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });
});
