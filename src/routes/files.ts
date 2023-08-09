import express from "express";
import multer from "multer";
const router = express.Router();

import {
  getFileById,
  sendEmailController,
  uploadFile,
} from "../controller/fileController";
const storage = multer.diskStorage({});
let upload = multer({
  storage,
});
router.post("/upload", upload.single("myFile"), uploadFile);

router.get("/:id", getFileById);

router.post("/email", sendEmailController);
export default router;
