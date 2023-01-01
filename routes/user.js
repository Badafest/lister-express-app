const express = require("express");
const { verifyUserToken } = require("../middlewares");
const {
  getPublicUserData,
  createUser,
  loginUser,
  resetPassword,
  getPrivateUserData,
} = require("../controllers/user");

const router = express.Router();

//get requests
//1. get user's public data
router.get("/public-data/:uname", getPublicUserData);
//2. get user's private data
router.get("/private-data/:_id", verifyUserToken, getPrivateUserData);

//post requests
//1. create new user
router.post("/create", createUser);
//2. login user
router.post("/login", loginUser);
//3. reset password
router.post("/reset-password", resetPassword);

module.exports = router;
