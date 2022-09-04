const User = require("../models/user.model");
const Course = require("../models/course.model");

exports.postCreateCourseController = (req, res) => {
  const name = req.body.courseTitle;
  const description = req.body.courseDescription;
  const courseParts = req.body.courseParts;
  Course.findOne({
    name,
  }).then((course) => {
    if (course) {
      return res.json({
        success: false,
        code: "coursealrex",
      });
    }
    const newCourse = new Course({
      courseName: name,
      description: description,
      user: req.user._id,
      notionPageIds: courseParts,
    });
    newCourse.save().then((result) => {
      return res.json({
        success: true,
      });
    });
  });
};
