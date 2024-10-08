import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  id:{ type: String },
  isAdmin:{type: Boolean, default: false},
  level:{ type: Number, default: 0},
  isOwner:{type: Boolean, default: false},
  // isCoach:{type: Boolean, default: true},

},{ timestamps: true });

const userModel = mongoose.model('userModel', userSchema);

export default userModel;