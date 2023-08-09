import mongoose, { ConnectOptions } from "mongoose";

export const isError = (value: unknown): value is Error => {
  return value instanceof Error;
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    } as ConnectOptions);
    console.log("Connected to the database");
  } catch (err) {
    if (isError(err)) {
      console.log("Connection Error:", err.message);
    } else {
      console.log("Unknown Error:", err);
    }
  }

  const connection = mongoose.connection;
  connection.on("error", () => {
    console.log("Connection failed");
  });
};

export default connectDB;
