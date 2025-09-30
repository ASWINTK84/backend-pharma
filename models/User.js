import mongoose from 'mongoose';

const EducationSchema = new mongoose.Schema({
  degree: String,
  institute: String,
  yearOfCompletion: String,
  marks: String
});

const ExperienceSchema = new mongoose.Schema({
  company: String,
  designation: String,
  from: String,
  to: String,
  responsibilities: String
});

const UserSchema = new mongoose.Schema({
  membershipId: { type: String, unique: true, sparse: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  password: { type: String, required: true },
  status: { type: String, enum: ['pending','active','blocked'], default: 'pending' },
  profilePhoto: { url: String, public_id: String },
  resume: { url: String, public_id: String, filename: String },
  dob: Date,
  gender: String,
  address: String,
  education: [EducationSchema],
  experience: [ExperienceSchema],
  skills: [String],
  languages: [String],
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
