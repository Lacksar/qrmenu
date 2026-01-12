import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  token: {
    type: String,
  },
});

export default mongoose.models.Session ||
  mongoose.model("Session", SessionSchema);
