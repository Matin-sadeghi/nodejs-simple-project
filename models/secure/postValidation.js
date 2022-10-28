const Yup = require("yup");

exports.schema = Yup.object().shape({
  title: Yup.string()
    .required("عنوان پست اجباری است")
    .min(5, "عنوان پست باید بیشتر از 4 کاراکتر باشد")
    .max(100, "عنوان پست باید کمتر از 100 کاراکتر باشد"),
  summary: Yup.string()
    .required("خلاصه پست اجباری است")
    .min(5, "خلاصه پست باید بیشتر از 4 کاراکتر باشد")
    .max(1000, "خلاصه پست باید کمتر از 1000 کاراکتر باشد"),
  body: Yup.string().required("پست جدید باید دارای محتوا باشد"),
  status: Yup.mixed().oneOf(
    ["public", "private"],
    "وضعیت باید'عمومی' یا 'خصوصی' باشد "
  ),
  thumbnail: Yup.object().shape({
    name: Yup.string().required("عکس بند انگشتی الزامی است"),
    size: Yup.number().max(
      3000000,
      "عکس بند انگشتی باید کمتر از 3 مگابایت باشد"
    ),
    mimetype: Yup.mixed().oneOf(
      ["image/jpeg", "image/png"],
      "تنها jpeg و png پشتیبانی می شود"
    ),
  }),
});
