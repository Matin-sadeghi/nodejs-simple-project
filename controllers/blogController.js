const Blog = require("./../models/blog");
const captchapng = require("captchapng");
const { formatDate } = require("./../utils/jalali");
const { truncate } = require("./../utils/helpers");
const { get500 } = require("./errorController");
const { sendEmail } = require("./../utils/mailer");
const Yup = require("yup");

let CAPTCHA_NUM;

exports.getIndex = async (req, res) => {
  const page = +req.query.page || 1;
  const postPerPage = 4;

  try {
    const numberOfPost = await Blog.find({
      status: "public",
    }).countDocuments();
    const posts = await Blog.find({ status: "public" })
      .sort({ createdAt: "desc" })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);
    res.render("index", {
      pageTitle: "وبلاگ",
      path: "/",
      posts,
      formatDate,
      truncate,
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      hasNextPage: postPerPage * page < numberOfPost,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(numberOfPost / postPerPage),
      auth:req.isAuthenticated()
    });
  } catch (err) {
    console.log(err);
    get500(req, res);
  }
};

exports.getSinglePost = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id).populate("user");
    if (!post) return res.redirect("/404");
    res.render("post", {
      pageTitle: post.title,
      path: "/post",
      post,
      formatDate,
      auth:req.isAuthenticated()

    });
  } catch (err) {
    console.log(err);
    get500(req, res);
  }
};

exports.getContactPage = (req, res) => {
  res.render("contact", {
    pageTitle: "تماس با ما",
    path: "/contact",
    message: req.flash("success_msg"),
    error: req.flash("error"),
    errors: [],
    auth:req.isAuthenticated()

  });
};
exports.handleContactPage = async (req, res) => {
  const errorArr = [];
  const { fullname, email, message, captcha } = req.body;

  const schema = Yup.object().shape({
    fullname: Yup.string().required("وارد کردن نام و نام خانوادگی الزامی است"),
    email: Yup.string()
      .email("ایمیل وارد شده صحیح نیست")
      .required("ایمیل الزامی است"),
    message: Yup.string().required("پیام اصلی الزامی است"),
  });
  try {
    await schema.validate(req.body, { abortEarly: false });

    if (parseInt(captcha) == CAPTCHA_NUM) {
      sendEmail(email, fullname, "پیام از طرف وبلاگ", message);
      req.flash("success_msg", "پیام شما با موفقیت ارسال شد");
      res.render("contact", {
        pageTitle: "تماس با ما",
        path: "/contact",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        errors: errorArr,
      auth:req.isAuthenticated()

      });
    } else {
      req.flash("error", "کد امنیتی صحیح نیست");
      res.render("contact", {
        pageTitle: "تماس با ما",
        path: "/contact",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        errors: errorArr,
      auth:req.isAuthenticated()

      });
    }
  } catch (err) {
    console.log(err);
    err.inner.forEach((e) => {
      errorArr.push({
        name: e.path,
        message: e.message,
      });
    });
    res.render("contact", {
      pageTitle: "تماس با ما",
      path: "/contact",
      message: req.flash("success_msg"),
      error: req.flash("error"),
      errors: errorArr,
      auth:req.isAuthenticated()

    });
  }
};

exports.getCaptcha = (req, res) => {
  CAPTCHA_NUM = parseInt(Math.random() * 9000 + 1000);

  const p = new captchapng(80, 30, CAPTCHA_NUM);
  p.color(0, 0, 0, 0);
  p.color(100, 20, 80, 255);
  const imagBase64 = Buffer.from(p.getBase64(), "base64");
  res.send(imagBase64);
};

exports.handleSearch = async (req, res) => {
  const page = +req.query.page || 1;
  const postPerPage = 4;

  try {
    const numberOfPost = await Blog.find({
      status: "public",
      $text: { $search: req.body.search },
    }).countDocuments();
    const posts = await Blog.find({
      status: "public",
      $text: { $search: req.body.search },
    })
      .sort({ createdAt: "desc" })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);
    res.render("index", {
      pageTitle: "نتایج جستجوی شما",
      path: "/",
      posts,
      formatDate,
      truncate,
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      hasNextPage: postPerPage * page < numberOfPost,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(numberOfPost / postPerPage),
      auth:req.isAuthenticated()

    });
  } catch (err) {
    console.log(err);
    get500(req, res);
  }
};
