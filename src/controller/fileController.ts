import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import File from "../models/File";
import https from "https";
import nodemailer, { TransportOptions } from "nodemailer";
// import createEmailTemplate from "../utils/createEmailTemplate";
// import config from "../config/vars";
import sendEmail from "../utils/sendEmail";
export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Hey bro! We need the file",
      });
    }

    let uploadFile: UploadApiResponse = {} as UploadApiResponse;
    try {
      uploadFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "ShareItNow",
        resource_type: "auto",
      });
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
      res.status(500).json({
        success: false,
        message: "Cloudinary Error :(",
      });
      return;
    }
    const { originalname } = req.file;
    const { secure_url, bytes, format } = uploadFile;

    const file = await File.create({
      filename: originalname,
      sizeInBytes: bytes,
      secure_url,
      format,
    });
    return res.status(201).json({
      success: true,
      file,
      downloadPageLink: `${process.env.API_BASE_ENDPOINT_CLIENT}download/${file._id}`,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log(err.message);
    }
    res.status(500).json({
      success: false,
      message: "Server Error :(",
    });
  }
};

export const getFileById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(id);
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File does not exist !",
      });
    }
    const { filename, sizeInBytes, format } = file;
    return res.status(200).json({
      success: true,
      file: {
        name: filename,
        sizeInBytes,
        format,
        id,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error :(" });
  }
};

export const sendEmailController = async (req: Request, res: Response) => {
  //? 1.validate request
  console.log(req.body);
  const { id, emailFrom, emailTo } = req.body;
  console.log({ id, emailFrom, emailTo });
  if (!id || !emailTo || !emailFrom) {
    return res.status(400).json({
      success: false,
      message: "Invalid data",
    });
  }

  //? 2. check if the file exists
  const file = await File.findById(id);
  if (!file) {
    return res.status(404).json({ message: "File does not exist" });
  }

  //? 3. create transporter
  // const transporter = nodemailer.createTransport({
  //   //@ts-ignore
  //   host: config.SENDINBLUE_SMPT_HOST,
  //   port: config.SENDINBLUE_SMTP_PORT,
  //   secure: false,
  //   auth: {
  //     user: config.SENDINBLUE_SMTP_USER,
  //     pass: config.SENDINBLUE_SMTP_PASSWORD,
  //   },
  // });

  //? 4.prepare th email data

  const { filename, sizeInBytes } = file;
  const fileSize = `${(Number(sizeInBytes) / (1024 * 1024)).toFixed(2)} MB`;

  const downloadPageLink = `${process.env.API_BASE_ENDPOINT_CLIENT}download/${id}`;
  const subject = "File shared with you";
  //@ts-ignore
  const isFileSend = await sendEmail({
    emailFrom,
    emailTo,
    subject,
    filename,
    fileSize,
    downloadPageLink,
  });

  //? 5. send mail using the transporter
  // const mailOption = {
  //   from: emailFrom,
  //   to: emailTo,
  //   subject: "File shared with you", // Subject line
  //   text: `${emailFrom} shared a file with you`, // plain text body
  //   html: createEmailTemplate(emailFrom, downloadPageLink, filename, fileSize), // html body
  // };
  // transporter.sendMail(mailOption, async (error, info) => {
  //   if (error) {
  //     console.log(error);
  //     return res.status(500).json({
  //       success: false,
  //       message: "server error :(",
  //     });
  //   }
  if (!isFileSend) {
    return res.status(500).json({
      success: false,
      message: "Server error :)",
    });
  }

  file.sender = emailFrom;
  file.receiver = emailTo;
  await file.save();
  return res.status(200).json({
    success: true,
    email: "Email Sent",
  });

  //? 6. save the data and send the response
};
