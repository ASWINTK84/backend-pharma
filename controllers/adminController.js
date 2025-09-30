import User from '../models/User.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from '../config/cloudinary.js';

export const dashboard = async (req, res) => {
  const total = await User.countDocuments({});
  const active = await User.countDocuments({ status: 'active' });
  const pending = await User.countDocuments({ status: 'pending' });
  const blocked = await User.countDocuments({ status: 'blocked' });
  res.json({ total, active, pending, blocked });
};

export const listUsers = async (req, res) => {
  const users = await User.find().select('membershipId fullName email status createdAt');
  res.json(users);
};

export const getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user);
};



export const editUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });

    //  updates

   if (req.files && req.files.profilePhoto) {
         const file = req.files.profilePhoto[0];
         const b64 = file.buffer.toString('base64');
         const dataUri = 'data:' + file.mimetype + ';base64,' + b64;
         
         if (user.profilePhoto && user.profilePhoto.public_id) {
           await cloudinary.uploader.destroy(user.profilePhoto.public_id);
         }
         const result = await cloudinary.uploader.upload(dataUri, { folder: 'socrp/profile' });
         user.profilePhoto = { url: result.secure_url, public_id: result.public_id };
       }
       if (req.files && req.files.resume) {
     const file = req.files.resume[0];
     const b64 = file.buffer.toString('base64');
     const dataUri = `data:${file.mimetype};base64,${b64}`;
   
     
     if (user.resume && user.resume.public_id) {
       await cloudinary.uploader.destroy(user.resume.public_id, { resource_type: 'raw' });
     }
   
     
     const result = await cloudinary.uploader.upload(dataUri, { folder: 'socrp/resume', resource_type: 'raw' });
   
     user.resume = { url: result.secure_url, public_id: result.public_id, filename: file.originalname };
   }
   
   
       
       const fields = ['fullName','dob','gender','address','phone','skills','languages','education','experience'];
       fields.forEach(f => {
         if (req.body[f] !== undefined) {
           
           if ((f === 'education' || f === 'experience') && typeof req.body[f] === 'string') {
             try { user[f] = JSON.parse(req.body[f]); } catch { user[f] = []; }
           } else if ((f === 'skills' || f === 'languages') && typeof req.body[f] === 'string') {
             user[f] = req.body[f].split(',').map(s => s.trim()).filter(Boolean);
           } else user[f] = req.body[f];
         }
       });
   
       await user.save();
       res.json({ message: 'Profile updated', user });
     } catch (err) {
       res.status(500).json({ message: 'Server error', error: err.message });
     }
   };
   








export const blockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  user.status = 'blocked';
  await user.save();
  res.json({ message: 'User blocked' });
};

export const unblockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  user.status = 'active';
  await user.save();
  res.json({ message: 'User unblocked' });
};


export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};





export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

   
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    
    const token = jwt.sign(
      { id: user._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      admin: { id: user._id, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
