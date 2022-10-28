const Yup = require("yup");
exports.schema = Yup.object().shape({
  fullname: Yup.string()
    .required("نام کاربری الزامی است")
    .min(3, "نام کاربری باید بیشتر از2 کاراکتر باشد")
    .max(255, "نام کاربری باید کمتر از 255 کاراکتر باشد"),
  email: Yup.string()
    .email("ایمیل معتبر نیست")
    .required("ایمیل الزامی می باشد"),
  password: Yup.string()
    .min(4, "کلمه عبور باید بیشتر از 4 کاراکتر باشد")
    .max(255, "کلمه عبور باید کمتر از 255 کاراکتر باشد")
    .required("کلمه عبور الزامی می باشد"),
  confirmPassword: Yup.string()
    .required("تکرار کلمه عبور الزامی می باشد")
    .oneOf([Yup.ref("password"), null], "کلمه های عبور یکسان نیستند"),
});
