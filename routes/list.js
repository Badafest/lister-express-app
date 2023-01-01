const express = require("express");
const {
  verifyUserToken,
  cloudinaryUpload,
  cloudinaryDelete,
} = require("../middlewares");
const {
  getPublicList,
  getPrivateList,
  getPublicLists,
  getUserLists,
  createList,
  editList,
  likeList,
  deleteList,
  addListItem,
  crossItem,
  editItem,
  deleteItem,
} = require("../controllers/list");

const router = express.Router();

router.get("/public-data/:_id", getPublicList);
router.get("/public-lists", getPublicLists);
router.get("/private-data/:_id", verifyUserToken, getPrivateList);
router.get("/user-lists", verifyUserToken, getUserLists);

router.post("/create", verifyUserToken, createList);
router.patch("/edit/:_id", verifyUserToken, editList);
router.patch("/like/:_id", verifyUserToken, likeList);
router.patch("/cross/:_id", verifyUserToken, crossItem);
router.patch("/edit-item/:_id", verifyUserToken, cloudinaryUpload, editItem);
router.delete("/delete-item/:_id", verifyUserToken, deleteItem);
router.delete("/delete/:_id", verifyUserToken, cloudinaryDelete, deleteList);
router.put("/add/:_id", verifyUserToken, cloudinaryUpload, addListItem);

module.exports = router;
