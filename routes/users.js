const { Router } = require("express");
const userController = require("./../controllers/userController");
const { authenticated } = require("./../middlewares/auth");

const router = new Router();

// Login page
// route GET /users/login
router.get("/login", userController.login);

// Login handle
// route POST /users/login
router.post("/login", userController.handleLogin, userController.rememberMe);

// Logout handle
// route Get /users/logout
router.get("/logout", authenticated, userController.logout);

// Register page
// route GET /users/register
router.get("/register", userController.register);

// Register Handle
// route POST /users/register
router.post("/register", userController.createUser);

// Forget Password Page
// route GET /users/forget-password
router.get("/forget-password", userController.forgetPassword);

// Handle Forget password page
// route POST /users/forget-password
router.post("/forget-password", userController.handleForgetPassword);


// Reset Password Page
// route GET /users/reset-password/:token
router.get("/reset-password/:token", userController.resetPassword);

// Handle Reset password page
// route POST /users/reset-password/:id
router.post("/reset-password/:id", userController.handleResetPassword);



module.exports = router;
