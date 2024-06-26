const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const buyRoutes = require("./routes/buyRoutes");
const Reward = require("./routes/Reward");
const addRoutes = require("./routes/addRoutes");
const contractorRoutes = require("./routes/contractorRoutes");

const app = express();
const PORT = process.env.PORT || 3300;
mongoose.set("strictQuery", false);
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// mongoose.connect(
//   "mongodb+srv://arzAdmin:ZiVjDtoZmd7GL9Wq@arz.0gim6se.mongodb.net/",
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   }
// );
mongoose
  .connect("mongodb+srv://arzAdmin:ZiVjDtoZmd7GL9Wq@arz.0gim6se.mongodb.net/", {
    // .connect("mongodb+srv://aladinx98:DCXRZpyZ0aSx2swa@cluster0.qsyiecy.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    })
  .then(() => {
    console.log("MongoDB connected...");
    // Drop the unique index on the email field
    mongoose.connection.db
      .collection("users")
      .dropIndex("email_1", (err, result) => {
        console.log("Index dropped");
      });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use("/api", userRoutes);
app.use("/api", buyRoutes);
app.use("/api", Reward);
app.use("/api", addRoutes);

app.use("/api", contractorRoutes);
app.get("/", async (req, res) => {
  res.send(`server is working`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
