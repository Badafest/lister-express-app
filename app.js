require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json({ limit: "10mb", extended: true }));
app.use(
  express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 })
);

//cors
const clientURLS = [process.env.CLIENT_URL, process.env.CLIENT_LOCAL_URL];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log(origin);
      if (!origin) {
        return callback(null, true);
      }
      clientURLS.indexOf(origin) !== -1
        ? callback(null, true)
        : callback(new Error("Not allowed by CORS"));
    },
  })
);

//db connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("DB CONNECTED SUCCESSFULLY");
  })
  .catch((err) => {
    console.log("DB CONNECTION FAILED WITH ERROR =>", err);
  });

//routes
for (route of fs.readdirSync("./routes")) {
  app.use(`/api/${route.split(".")[0]}`, require(`./routes/${route}`));
}

app.all("*", (req, res) => {
  res.send("Method not allowed");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("SERVER LISTENING ON PORT " + PORT);
});
