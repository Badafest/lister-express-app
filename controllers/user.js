const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const getPublicUserData = async (req, res) => {
  const { uname } = req.params;
  try {
    const user = await User.findOne({ username: uname }).select(
      "username profile"
    );
    res.json({
      ok: true,
      data: user,
    });
  } catch (err) {
    console.log("ERROR IN FETCHING PUBLIC USER DATA => ", err);
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

const getPrivateUserData = async (req, res) => {
  const { _id } = req.params;
  try {
    const user = await User.findById(_id).select("-password");
    res.json({
      ok: true,
      data: user,
    });
  } catch (err) {
    console.log("ERROR IN FETCHING PRIVATE USER DATA => ", err);
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

const createUser = async (req, res) => {
  const userData = req.body;
  if (userData.username && userData.email && userData.password) {
    try {
      const user = await User.create(userData);
      const { _id, username } = user;
      res.json({
        ok: true,
        data: { _id, username },
      });
    } catch (err) {
      console.log("ERROR IN CREATE USER => ", err);
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

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    try {
      const user = await User.findOne({ username });
      if (user) {
        const result = user.comparePassword(password);
        if (result) {
          res.json({
            ok: true,
            data: {
              username,
              _id: user._id,
              token: jwt.sign(
                { username, _id: user._id },
                process.env.JWT_SECRET,
                {
                  expiresIn: `14d`,
                }
              ),
            },
          });
        } else {
          res.status(500).json({
            ok: false,
            message: "Password is incorrect",
          });
        }
      } else {
        res.status(500).json({
          ok: false,
          message: "User not found",
        });
      }
    } catch (err) {
      console.log("ERROR IN USER AUTHENTICATION => ", err);
      res.status(500).json({
        ok: false,
        message: err.message,
      });
    }
  } else {
    res.status(500).json({
      ok: false,
      message: "Username and Password are required",
    });
  }
};

const resetPassword = async (req, res) => {
  const userData = req.body;

  if (userData.username && userData.email && userData.password) {
    try {
      const user = await User.findOneAndUpdate(
        {
          email: userData.email,
          username: userData.username,
        },
        { password: bcrypt.hashSync(userData.password, 10) }
      );

      if (!user) {
        res.status(500).json({
          ok: false,
          message: "No user was found with given username and email",
        });
        return 0;
      }
      const { _id, username } = user;
      res.json({
        ok: true,
        data: { _id, username },
      });
    } catch (err) {
      console.log("ERROR IN RESET PASSWORD => ", err);
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
      message: "Error occurred due to bad request",
    });
  }
};

module.exports = {
  getPublicUserData,
  getPrivateUserData,
  createUser,
  loginUser,
  resetPassword,
};
