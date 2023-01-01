const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
// Return "https" URLs by setting secure: true
cloudinary.config({
  secure: true,
});

const verifyUserToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res.status(401).send({
      ok: false,
      message: "No logged in user was found",
    });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).send({
        ok: false,
        message: "Error in user authorization",
      });
    }
    req.user = user;
    next();
  });
};

const cloudinaryUpload = async (req, res, next) => {
  try {
    console.log(req.body);
    // Upload the image
    if (req.body.image) {
      const result = await cloudinary.uploader.upload(req.body.image, {
        folder: "lister-list-images",
      });

      req.body.image = { url: result.secure_url, public_id: result.public_id };
    }
    next();
  } catch (error) {
    console.log("ERROR IN IMAGE UPLOAD => ", error);
    return res.status(401).json({
      ok: false,
      message: "Error in image upload",
    });
  }
};

const cloudinaryDelete = async (req, res, next) => {
  try {
    // Delete the images
    console.log(req.body);
    if (req.body.images.length) {
      req.body.images.forEach(async (image) => {
        image &&
          image.public_id &&
          (await cloudinary.uploader.destroy(image.public_id));
      });
    }
    next();
  } catch (error) {
    console.log("ERROR IN IMAGE DELETE => ", error);
    return res.status(401).json({
      ok: false,
      message: "Error in image delete",
    });
  }
};

module.exports = { verifyUserToken, cloudinaryUpload, cloudinaryDelete };
