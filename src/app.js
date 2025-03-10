import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import config from "./app/config/index.js";
import router from "./app/modules/route/index.js";

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());

const startServer = async () => {
  try {
    await mongoose.connect(config.db_url);
    console.log("Connected to the database");

    app.listen(5000, () => {
      console.log(`Server is running on port 5000`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Hello World");
});



startServer();

export default app;
