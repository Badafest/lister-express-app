const User = require("./User");

const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const ListSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "can't be blank"],
      index: true,
    },
    author: {
      type: mongoose.ObjectId,
      required: [true, "can't be blank"],
      index: true,
      ref: User,
    },
    isPublic: {
      type: Boolean,
      required: [true, "can't be blank"],
      default: false,
    },
    likes: [mongoose.ObjectId],
    items: [
      {
        title: {
          type: String,
          required: true,
          default: "Untitled List",
        },
        description: String,
        image: { url: String, public_id: String },
        image_caption: String,
        crossed: {
          type: Boolean,
          default: false,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

ListSchema.pre("save", function (next) {
  this.author = mongoose.Types.ObjectId(this.author);
  next();
});

module.exports = mongoose.model("List", ListSchema);
