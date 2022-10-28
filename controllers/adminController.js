const sharp = require("sharp");
const shortid = require("shortid");
const appRoot = require("app-root-path");
const Blog = require("./../models/blog");
const { formatDate } = require("./../utils/jalali");
const { get500 } = require("./errorController");
const fs = require("fs");

exports.getDashboard = async (req, res) => {
  const page = +req.query.page || 1;
  const postPerPage = 4;

  try {
    const numberOfPost = await Blog.find({
      user: req.user._id,
    }).countDocuments();
    const blogs = await Blog.find({ user: req.user.id })
      .sort({ createdAt: "desc" })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);
      res.set(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    res.render("private/blogs", {
      pageTitle: "بخش مدیریت | داشبورد",
      path: "/dashboard",
      layout: "./layouts/dashLayout",
      fullname: req.user.fullname, //passportjs
      message: req.flash("sueccss_msg"),
      blogs,
      formatDate,
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      hasNextPage: postPerPage * page < numberOfPost,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(numberOfPost / postPerPage),
      x: 1,
    });
  } catch (err) {
    console.log(err);
    get500(req, res);
  }
};

exports.getAddPost = (req, res) => {
  res.render("private/addPost", {
    pageTitle: "بخش مدیریت | ساخت پست جدید",
    path: "/dashboard/add-post",
    layout: "./layouts/dashLayout",
    fullname: req.user.fullname, //passportjs
  });
};

exports.getEditPost = async (req, res) => {
  const id = req.params.id;
  const post = await Blog.findById(id);
  if (!post) {
    return res.redirect("/404");
  }
  if (post.user.toString() != req.user._id) {
    return res.redirect("/dashboard");
  } else {
    res.render("private/editPost", {
      pageTitle: "بخش مدیریت | ویرایش پست",
      path: "/dashboard/edit-post",
      layout: "./layouts/dashLayout",
      fullname: req.user.fullname, //passportjs
      post,
    });
  }
};

exports.editPost = async (req, res) => {
  const errorArr = [];
  const post = await Blog.findById(req.params.id);
  const thumbnail = req.files ? req.files.thumbnail : {};
  const fileName = `${shortid.generate()}_${thumbnail.name}`;
  const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
  try {
    if (thumbnail.name) {
      await Blog.postValidation({ ...req.body, thumbnail });
    } else {
      await Blog.postValidation({
        ...req.body,
        thumbnail: { name: "placeholder", size: 2, mimetype: "image/jpeg" },
      });
    }
    if (!post) {
      return res.redirect("/404");
    }
    if (post.user.toString() != req.user._id) {
      return res.redirect("/dashboard");
    } else {
      if (thumbnail.name) {
        //عکس جدید داده
        fs.unlink(
          `${appRoot}/public/uploads/thumbnails/${post.thumbnail}`, //حذف عکس قدیمی
          async (err) => {
            if (err) {
              console.log(err);
            } else {
              await sharp(thumbnail.data)
                .jpeg({ quality: 60 })
                .toFile(uploadPath)
                .catch((err) => {
                  console.log(err);
                });
            }
          }
        );
      }

      const { title, status, body, summary } = req.body;
      post.title = title;
      post.status = status;
      post.body = body;
      post.summary = summary;
      post.thumbnail = thumbnail.name ? fileName : post.thumbnail;

      await post.save();
    }

    req.flash("sueccss_msg", "پست شما با موفقیت ویرایش شد");
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    err.inner.forEach((e) => {
      errorArr.push({
        name: e.path,
        message: e.message,
      });
    });

    res.render("private/editPost", {
      pageTitle: "بخش مدیریت | ویرایش پست ",
      path: "/dashboard/edit-post",
      layout: "./layouts/dashLayout",
      fullname: req.user.fullname, //passportjs
      errors: errorArr,
      post,
    });
  }
};

exports.createPost = async (req, res) => {
  const errorArr = [];
  const thumbnail = req.files ? req.files.thumbnail : {};
  const fileName = `${shortid.generate()}_${thumbnail.name}`;
  const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
  try {
    req.body = { ...req.body, thumbnail };
    const { title, status, body, summary } = req.body;
    await Blog.postValidation(req.body);

    await sharp(thumbnail.data)
      .jpeg({ quality: 60 })
      .toFile(uploadPath)
      .catch((err) => {
        console.log(err);
      });

    await Blog.create({
      title,
      status,
      body,
      summary,
      user: req.user.id,
      thumbnail: fileName,
    });
    req.flash("sueccss_msg", "پست جدید با موفقیت ثبت شد");
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    err.inner.forEach((e) => {
      errorArr.push({
        name: e.path,
        message: e.message,
      });
    });

    res.render("private/addPost", {
      pageTitle: "بخش مدیریت | ساخت پست جدید",
      path: "/dashboard/add-post",
      layout: "./layouts/dashLayout",
      fullname: req.user.fullname, //passportjs
      errors: errorArr,
    });
  }
};

exports.uploadImage = async (req, res) => {
  if (req.files.image.size > 4000000) {
    return res.status(400).json({
      address: "",
      message: "",
      error: "حجم عکس باید کمتر از 4 مگابایت باشد",
    });
  }
  if (req.files.image.mimetype != "image/jpeg") {
    return res.status(400).json({
      address: "",
      message: "",
      error: "تنها پسوند JPEG پشتیبانی میشود",
    });
  }
  if (req.files) {
    const fileName = `${shortid.generate()}_${req.files.image.name}`;
    await sharp(req.files.image.data)
      .jpeg({
        quality: 60,
      })
      .toFile(`./public/uploads/${fileName}`)
      .catch((err) => {
        console.log(err);
      });
    res.status(200).json({
      address: `http://localhost:3000/uploads/${fileName}`,
      message: "آپلود عکس موفقیت آمیز بود",
      error: "",
    });
  } else {
    res.send("ابتدا عکس خود را انتخاب کنید");
  }
};

exports.delete = async (req, res) => {
  const post = await Blog.findById(req.params.id);
  if (!post) {
    return res.redirect("/404");
  }
  if (post.user.toString() != req.user._id) {
    return res.redirect("/dashboard");
  }
  try {
    const id = req.params.id;
    fs.unlinkSync(`${appRoot}/public/uploads/thumbnails/${post.thumbnail}`);
    await Blog.findByIdAndDelete(id);
    req.flash("sueccss_msg","پست با موفقیت حذف شد"),
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    get500(req, res);
  }
};

exports.handleSearch = async (req,res)=>{
  const page = +req.query.page || 1;
  const postPerPage = 4;

  try {
    const numberOfPost = await Blog.find({
      user: req.user._id,
      $text:{$search:req.body.search}
    }).countDocuments();
    const blogs = await Blog.find({ user: req.user.id,$text:{$search:req.body.search} })
      .sort({ createdAt: "desc" })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);
    res.render("private/blogs", {
      pageTitle: "بخش مدیریت | داشبورد",
      path: "/dashboard",
      layout: "./layouts/dashLayout",
      fullname: req.user.fullname, //passportjs
      message: req.flash("sueccss_msg"),
      blogs,
      formatDate,
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      hasNextPage: postPerPage * page < numberOfPost,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(numberOfPost / postPerPage),
      x: 1,
    });
  } catch (err) {
    console.log(err);
    get500(req, res);
  }
}

