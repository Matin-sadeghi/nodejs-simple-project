exports.get404 = (req, res) => {
  res.render("errors/404", {
    pageTitle: "404 | not found",
    path: "/404",
  });
};
exports.get500 = (req, res) => {
  res.render("errors/500", {
    pageTitle: "خطای سرور | 500",
    path: "/404", //for css
  });
};
