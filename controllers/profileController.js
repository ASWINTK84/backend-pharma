import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import axios from 'axios';

// get profile
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

// update profile (personal info + arrays)
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Not found' });

    // handle file updates
    if (req.files && req.files.profilePhoto) {
      const file = req.files.profilePhoto[0];
      const b64 = file.buffer.toString('base64');
      const dataUri = 'data:' + file.mimetype + ';base64,' + b64;
      // delete old if exists
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

  // Delete old resume if exists
  if (user.resume && user.resume.public_id) {
    await cloudinary.uploader.destroy(user.resume.public_id, { resource_type: 'raw' });
  }

  // Upload resume as raw
  const result = await cloudinary.uploader.upload(dataUri, { folder: 'socrp/resume', resource_type: 'raw' });

  user.resume = { url: result.secure_url, public_id: result.public_id, filename: file.originalname };
}


    // update scalar fields and arrays (expect client to send arrays)
    const fields = ['fullName','dob','gender','address','phone','skills','languages','education','experience'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        // education/experience may be sent as JSON strings
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








export const getResume = async (req, res) => {
  try {
    const { public_id } = req.params;
    const user = await User.findOne({ 'resume.public_id': public_id });

    if (!user || !user.resume) return res.status(404).send('Resume not found');

    // Get the raw file from Cloudinary
    const fileUrl = user.resume.url; // Cloudinary URL
    const filename = user.resume.filename || 'resume.pdf';

    // Fetch file as stream
    const response = await axios.get(fileUrl, { responseType: 'stream' });

    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');

    // Pipe the stream to client
    response.data.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};