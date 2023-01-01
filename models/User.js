const mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  bcrypt = require("bcrypt");

const UserSchema = new Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [
        /^[a-z0-9!@#$%_]+$/,
        "can contain lowercase letters, digits or !,@,#,$,%,_ only.",
      ],
      index: true,
      unique: true,
    },
    //Our password is hashed with bcrypt
    password: {
      type: String,
      required: [true, "can't be blank"],
      min: 8,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d~`!@#$%^&*()_+=-]{8,}$/,
        "must contain minimum eight characters, at least one uppercase letter, one lowercase letter and one number",
      ],
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "is not a valid email address.",
      ],
      index: true,
      required: true,
      unique: true,
    },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (plaintext) {
  return bcrypt.compareSync(plaintext, this.password);
};

module.exports = mongoose.model("User", UserSchema);
