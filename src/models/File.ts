import mongoose, { Document, Schema, Model } from "mongoose";
interface IFile extends Document {
  filename: string;
  secure_url: string;
  sizeInBytes: string;
  format: string;
  sender?: string;
  receiver?: string;
}
const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, "Enter the Filename"],
    },
    secure_url: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      required: true,
    },
    sizeInBytes: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
    },
    receiver: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const File = mongoose.model<IFile>("File", fileSchema);

export default File;
