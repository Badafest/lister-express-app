const List = require("../models/List");
const cloudinary = require("cloudinary").v2;

const getPublicList = async (req, res) => {
  const { _id } = req.params;
  try {
    const list = await List.findById(_id).populate("author", "_id username");
    if (list) {
      if (list.isPublic) {
        res.json({
          ok: true,
          data: list,
        });
      } else {
        res.status(500).json({
          ok: false,
          message: "The list is private.",
        });
      }
    } else {
      res.status(500).json({
        ok: false,
        message: "No list found",
      });
    }
  } catch (err) {
    console.log("ERROR IN GET PUBLIC LIST => ", err);
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

const getPrivateList = async (req, res) => {
  const list_id = req.params._id;
  const user_id = req.user._id;
  try {
    const list = await List.findById(list_id).populate(
      "author",
      "_id username"
    );
    if (list) {
      if (list.isPublic) {
        res.json({
          ok: true,
          data: list,
        });
      } else {
        if (list.author) {
          if (String(list.author._id) === user_id) {
            res.json({
              ok: true,
              data: list,
            });
          } else {
            res.status(500).json({
              ok: false,
              message: "Not permitted to view private list",
            });
          }
        } else {
          res.status(500).json({
            ok: false,
            message: "Author was not found.",
          });
        }
      }
    } else {
      res.status(500).json({
        ok: false,
        message: "No list found",
      });
    }
  } catch (err) {
    console.log("ERROR IN FETCHING PRIVATE LIST => ", err);
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

const getUserLists = async (req, res) => {
  try {
    const user_id = req.user._id;
    const lists = await List.find({ author: user_id }).populate(
      "author",
      "_id username"
    );
    res.json({
      ok: true,
      data: lists,
    });
  } catch (error) {
    console.log("ERROR IN GET USER LISTS => ", error);
    res.status(500).json({
      ok: false,
      message: "Couldn't get user lists",
    });
  }
};

const getPublicLists = async (req, res) => {
  try {
    const lists = await List.find({ isPublic: true }).populate(
      "author",
      "_id username"
    );
    res.json({
      ok: true,
      data: lists,
    });
  } catch (error) {
    console.log("ERROR IN GET PUBLIC LISTS => ", error);
    res.status(500).json({
      ok: false,
      message: "Couldn't get public lists",
    });
  }
};

const createList = async (req, res) => {
  const listData = req.body;
  if (listData.title && listData.author) {
    try {
      const list = await List.create(listData);
      const { _id, title } = list;
      res.json({
        ok: true,
        data: { _id, title },
      });
    } catch (err) {
      console.log("ERROR IN CREATE LIST => ", err);
      res.status(500).json({
        ok: false,
        message:
          err.code === 11000
            ? `${Object.keys(err.keyValue)[0]} is already taken`
            : err.message,
      });
    }
  } else {
    res.status(500).json({
      ok: false,
      message: "Error occurred due to bad request body",
    });
  }
};

const editList = async (req, res) => {
  const listData = req.body;
  const list_id = req.params._id;
  if (listData.title) {
    try {
      const list = await List.findById(list_id);
      if (list) {
        if (String(list.author) === req.user._id) {
          const newList = await List.findByIdAndUpdate(list._id, listData, {
            new: true,
          });
          res.json({
            ok: true,
            data: newList,
          });
        } else {
          res
            .status(500)
            .json({ ok: false, message: "Only author can edit list" });
        }
      } else {
        res.status(500).json({ ok: false, message: "List not found" });
      }
    } catch (err) {
      console.log("ERROR IN EDIT LIST => ", err);
      res.status(500).json({
        ok: false,
        message: err.message,
      });
    }
  } else {
    res.status(500).json({
      ok: false,
      message: "Error occurred due to bad request body",
    });
  }
};

const deleteList = async (req, res) => {
  const list_id = req.params._id;
  try {
    const list = await List.findById(list_id);
    if (list) {
      if (String(list.author) === req.user._id) {
        await list.delete();
        res.json({
          ok: true,
          message: "List successfully deleted",
        });
      } else {
        res
          .status(500)
          .json({ ok: false, message: "Only author can delete list" });
      }
    } else {
      res.status(500).json({ ok: false, message: "List not found" });
    }
  } catch (err) {
    console.log("ERROR IN DELETE LIST => ", err);
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

const addListItem = async (req, res) => {
  const itemData = req.body;
  const list_id = req.params._id;
  const user_id = req.user._id;
  try {
    if (!itemData.title) {
      itemData.image &&
        itemData.image.public_id &&
        (await cloudinary.uploader.destroy(itemData.image.public_id));
      return res.status(500).json({
        ok: false,
        message: "Title is missing in item data",
      });
    }
    const list = await List.findById(list_id).populate("author", "_id");
    if (!list) {
      itemData.image &&
        itemData.image.public_id &&
        (await cloudinary.uploader.destroy(itemData.image.public_id));
      return res.status(500).json({
        ok: false,
        message: "List not found",
      });
    }

    const author_id = list.author._id;
    if (String(author_id) === user_id) {
      list.items.push(itemData);
      await list.save();
      res.json({
        ok: true,
        message: "Successfully added item to list",
      });
    } else {
      itemData.image &&
        itemData.image.public_id &&
        (await cloudinary.uploader.destroy(itemData.image.public_id));
      return res.status(500).json({
        ok: false,
        message: "Only author can edit list",
      });
    }
  } catch (error) {
    console.log("ERROR IN ADD LIST ITEM => ", error);
    itemData.image &&
      itemData.image.public_id &&
      (await cloudinary.uploader.destroy(itemData.image.public_id));
    res.status(500).json({
      ok: false,
      message: "Couldn't add item to list",
    });
  }
};

const likeList = async (req, res) => {
  const list_id = req.params._id;

  try {
    const list = await List.findById(list_id);
    if (list) {
      const newList = await List.findByIdAndUpdate(
        list._id,
        list.likes.includes(req.user._id)
          ? { $pull: { likes: req.user._id } }
          : { $push: { likes: req.user._id } },
        {
          new: true,
        }
      );
      res.json({
        ok: true,
        data: newList,
      });
    } else {
      res.status(500).json({ ok: false, message: "List not found" });
    }
  } catch (err) {
    console.log("ERROR IN LIKE LIST => ", err);
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

const crossItem = async (req, res) => {
  const list_id = req.params._id;
  const { item, cross } = req.query;

  try {
    const list = await List.findById(list_id);
    if (list) {
      if (String(list.author) === req.user._id) {
        list.items[parseInt(item)].crossed = Boolean(cross === "true");
        console.log(list);
        await list.save();
        res.json({
          ok: true,
          data: { crossed: list.items[parseInt(item)].crossed },
        });
      } else {
        res
          .status(500)
          .json({ ok: false, message: "Only author can edit list" });
      }
    } else {
      res.status(500).json({ ok: false, message: "List not found" });
    }
  } catch (err) {
    console.log("ERROR IN EDIT LIST => ", err);
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

const editItem = async (req, res) => {
  const itemData = req.body;
  const list_id = req.params._id;
  const { item } = req.query;

  if (itemData.title) {
    try {
      const list = await List.findById(list_id);
      if (list) {
        if (String(list.author) === req.user._id) {
          const oldItem = list.items[parseInt(item)];
          oldItem.image &&
            oldItem.image.public_id &&
            (await cloudinary.uploader.destroy(oldItem.image.public_id));
          list.items[parseInt(item)] = { ...oldItem, ...itemData };
          await list.save();
          res.json({
            ok: true,
            data: list,
          });
        } else {
          res
            .status(500)
            .json({ ok: false, message: "Only author can edit list" });
        }
      } else {
        res.status(500).json({ ok: false, message: "List not found" });
      }
    } catch (err) {
      console.log("ERROR IN EDIT LIST => ", err);
      res.status(500).json({
        ok: false,
        message: err.message,
      });
    }
  } else {
    res.status(500).json({
      ok: false,
      message: "Error occurred due to bad request body",
    });
  }
};

const deleteItem = async (req, res) => {
  const list_id = req.params._id;
  const { item } = req.query;

  try {
    const list = await List.findById(list_id);
    if (list) {
      if (String(list.author) === req.user._id) {
        if (list.items[item]) {
          list.items[item].image &&
            list.items[item].image.public_id &&
            (await cloudinary.uploader.destroy(
              list.items[item].image.public_id
            ));
          list.items.splice(item, 1);
          await list.save();
        }
        res.json({
          ok: true,
          data: list,
        });
      } else {
        res
          .status(500)
          .json({ ok: false, message: "Only author can edit list" });
      }
    } else {
      res.status(500).json({ ok: false, message: "List not found" });
    }
  } catch (err) {
    console.log("ERROR IN EDIT LIST => ", err);
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

module.exports = {
  createList,
  editList,
  likeList,
  crossItem,
  editItem,
  deleteItem,
  deleteList,
  addListItem,
  getPublicList,
  getPrivateList,
  getUserLists,
  getPublicLists,
};
