const { Router } = require("express");
const { authenticated } = require("./../middlewares/auth");
const adminController = require("./../controllers/adminController");

const router = new Router();

// Dashboard
// route GET /dashboard

router.get("/", authenticated, adminController.getDashboard);

// Add Post
// route GET /dashboard/add-post
router.get("/add-post", authenticated, adminController.getAddPost);

// Create Post
// route POST /dashboard/add-post
router.post("/add-post", authenticated, adminController.createPost);


// Upload Image
// route POST /dashboard/image-upload
router.post("/image-upload", authenticated, adminController.uploadImage);

// Delete Blog
// route GET /dashboard/delete/:id
router.get("/delete-post/:id", authenticated, adminController.delete);


// Eait Blog
// route GET /dashboard/edit/:id
router.get("/edit-post/:id", authenticated, adminController.getEditPost);


// Eait Blog Handle
// route POST /dashboard/edit/:id
router.post("/edit-post/:id", authenticated, adminController.editPost);


// Handle Search
// route POST /dashboard/search
router.post("/search", authenticated, adminController.handleSearch);


module.exports = router;
