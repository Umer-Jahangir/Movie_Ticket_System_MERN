import mongoose from "mongoose";

const connectDB = async () => {
  try {
      mongoose.connection.on('connected', () => {
      console.log(`Database connected successfully`);
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/Ticket_System`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit the process with failure
  }
}
export default connectDB;