const User = require("./../models/user");
const passport = require("passport");
const fetch = require("node-fetch");
const { authenticate } = require("passport");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("./../utils/mailer");
const bcrypt = require("bcryptjs");

exports.login = (req, res) => {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
);
  res.render("login", {
    pageTitle: "ورود به بخش مدیریت",
    path: "/login",
    message: req.flash("success_msg"),
    error: req.flash("error"),
  });
};

exports.handleLogin = async (req, res, next) => {
  if (!req.body["g-recaptcha-response"]) {
    req.flash("error", "اعبار سنجی captcha الزامی است");
    return res.redirect("/users/login");
  }

  const secretKey = process.env.CAPTCHA_SEVRET;
  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body["g-recaptcha-response"]}&remoteip=${req.connection.remoteAddress}`;

  const response = await fetch(verifyUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    },
  });
  const json = await response.json();

  if (json.success) {
    passport.authenticate("local", {
      // successRedirect: "/dashboard",  // in rememberMe we do it
      failureRedirect: "/users/login",
      failureFlash: true, //key=error
    })(req, res, next);
  } else {
    req.flash("error", "مشکلی برای captcha پیش آمده");
    return res.redirect("/users/login");
  }
};

exports.rememberMe = (req, res) => {
  if (req.body.rememberMe) {
    req.session.cookie.originalMaxAge = 24 * 60 * 60 * 60 * 1000; // 24h
  } else {
    req.session.cookie.expire = null;
  }
  res.redirect("/dashboard");
};

exports.logout = (req, res,next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  req.session = null;
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
);
  // req.flash("success_msg", "خروج موفقیت آمیز بود");
  res.redirect("/users/login");
};
exports.register = (req, res) => {
  res.render("register", {
    pageTitle: "ثبت نام کاربر جدید",
    path: "/register",
  });
};
exports.createUser = async (req, res) => {
  const errors = [];

  try {
    await User.userValidation(req.body);

    const { fullname, email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      errors.push({
        message: "کاربری با این ایمیل موجود است",
      });
      return res.render("register", {
        pageTitle: "ثبت نام کاربر",
        path: "/register",
        errors,
      });
    } else {
      await User.create({ fullname, email, password });
      req.flash("success_msg", "ثبت نام موفقیت آمیز بود");
      res.redirect("/users/login");
    }
  } catch (err) {
    err.inner.forEach((e) => {
      errors.push({
        name: e.path,
        message: e.message,
      });
    });

    return res.render("register", {
      pageTitle: "ثبت نام کاربر",
      path: "/register",
      errors,
    });
  }
};

exports.forgetPassword = async (req, res) => {
  res.render("forgetPass", {
    pageTitle: "فراموشی کلمه عبور",
    path: "/login", //for css
    message: req.flash("success_msg"), //اکر نباشه خطا میده
    error: req.flash("error"),
  });
};

exports.handleForgetPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    req.flash("error", "کاربری با این ایمیل پیدا نشد");
    return res.render("forgetPass", {
      pageTitle: "فراموشی کلمه عبور",
      path: "/login", //for css
      message: req.flash("success_msg"), //اکر نباشه خطا میده
      error: req.flash("error"),
    });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const resetLink = `http://localhost:3000/users/reset-password/${token}`;

  sendEmail(
    user.email,
    user.fullname,
    "قراموشی رمز عبور",
    `
  جهت تغییر کلمه عبور روی لینک زیر کلیک کنید
  <a href="${resetLink}"> لینک تغییر کلمه عبور</a>
  `
  );
  req.flash("success_msg", "ایمیل تغییر کلمه عبور با موفقیت ارسال شد");
  res.render("forgetPass", {
    pageTitle: "فراموشی کلمه عبور",
    path: "/login", //for css
    message: req.flash("success_msg"), //اکر نباشه خطا میده
    error: req.flash("error"),
  });
};

exports.resetPassword = async (req, res) => {
  const token = req.params.token;
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.log(err);
    if (!decodedToken) {
      res.redirect("/404");
    }
  }
  res.render("resetPass", {
    pageTitle: "تغییر رمز عبور",
    path: "/login",
    message: req.flash("success_msg"),
    error: req.flash("error"),
    userId: decodedToken.userId,
  });
};

exports.handleResetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  if (password != confirmPassword ||password.length<4||confirmPassword.length<4) {
    if(password != confirmPassword){
    req.flash("error", "کلمه های عبور یکسان نیستند");
  }else if(password.length<4){
    req.flash("error", "کلمه عبور باید بیشتر از 3 کاراکتر باشد");
  }else{
    req.flash("error", "تکرار کلمه عبور باید بیشتر از 3 کاراکتر باشد");
  }
    return res.render("resetPass", {
      pageTitle: "تغییر رمز عبور",
      path: "/login",
      message: req.flash("success_msg"),
      error: req.flash("error"),
      userId: req.params.id,
    });
  }

  const user = await User.findOne({ _id: req.params.id });
  if (!user) {
    return res.redirect("/404");
  }

  user.password = password;
  await user.save();

  req.flash("success_msg", "کلمه عبور با موفقیت بروزرسانی شد ");
  res.redirect("/users/login");
};

//
// bcrypt.genSalt(10, (err, salt) => {
//   if (err) throw err;
//   bcrypt.hash(password, salt, async (err, hash) => {
//     if (err) throw err;
//     await User.create({
//       fullname,
//       email,
//       password: hash,
//     });
//     res.redirect("/users/login");
//   });
// });
