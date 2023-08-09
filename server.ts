import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db";
import fileRoutes from "./src/routes/files";
import { v2 as cloudinary } from "cloudinary";
import path from "path";

const app = express();
const __dirname = path.dirname(new URL(import.meta.url).pathname);
dotenv.config({});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

connectDB();

app.use(cors({}));
app.use(express.json({}));
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/api/v1/files", fileRoutes);

//static files
app.use(express.static(path.join(__dirname, "./client/build")));

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

const PORT = process.env.PORT || 8008;
app.listen(8008, () => console.log(`Server is listening on PORT ${PORT}`));
