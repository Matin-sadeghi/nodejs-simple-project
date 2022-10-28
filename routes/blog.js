const { Router } = require("express");
const blogController = require('./../controllers/blogController');

const router = new Router();

//  Weblog Index Page
//  route GET /
router.get("/", blogController.getIndex);


//  Weblog Post Page
//  route GET /post/:id
router.get("/post/:id", blogController.getSinglePost);


//  Weblog Contact  Page
//  route GET /contact
router.get("/contact", blogController.getContactPage);

//  Weblog Handle Contact  Page
//  route post /contact
router.post("/contact", blogController.handleContactPage);


//  Weblog Numric  Captcha
//  route GET /captcha.png
router.get("/captcha.png", blogController.getCaptcha);

//  Weblog Handle Search  
//  route post /search
router.post("/search", blogController.handleSearch);




module.exports = router;
