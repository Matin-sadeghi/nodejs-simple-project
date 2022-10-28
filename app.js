const express = require("express");
const expressLayout = require("express-ejs-layouts");
const dotEnv = require("dotenv");
const morgan = require("morgan");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const bodyParser = require('body-parser');
const debug = require("debug")("weblog");
const  fileUpload= require('express-fileupload');
const path = require("path");
const connectDB = require("./config/db");
const winston = require("./config/winston");

// load config
dotEnv.config({
  path: "./config/config.env",
});

//Database connection
connectDB();
debug("conneect to DB");

// Passport confing
require("./config/passport");

const app = express();
//Loggin
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("combined", { stream: winston.stream }));
//   debug("active morgan");
// }

//View Engine
app.use(expressLayout);
app.set("view engine", "ejs");
app.set("views", "views");
app.set("layout", "./layouts/mainLayout");

//BodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//File Upload
app.use(fileUpload());


//Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    unset: "destroy",
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);


// Passport
app.use(passport.initialize());
app.use(passport.session());
//Flash
app.use(flash()); //req.flash key value

//Static folder
app.use(express.static(path.join(__dirname, "public")));

//routes
app.use("/", require("./routes/blog"));
app.use("/users", require("./routes/users"));
app.use("/dashboard", require("./routes/dashboard"));
// 404 Page
app.use(require("./controllers/errorController").get404);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode  on port ${PORT}`
  );
});
