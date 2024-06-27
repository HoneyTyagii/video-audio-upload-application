const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const aws = require('aws-sdk');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Setup
mongoose.connect('mongodb://localhost:27017/uploadApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const FileSchema = new mongoose.Schema({
  title: String,
  description: String,
  filename: String,
  metadata: Object,
  s3Key: String,
});

const File = mongoose.model('File', FileSchema);

// AWS S3 Setup
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({ dest: 'uploads/' });

// Helper function to get file duration
const getFileDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata.format.duration;
      resolve(duration);
    });
  });
};

// Endpoint for file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const { title, description } = req.body;

  try {
    const duration = await getFileDuration(filePath);

    if (duration > 1800) { // 30 minutes in seconds
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'File duration exceeds 30 minutes' });
    }

    const fileStream = fs.createReadStream(filePath);
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: req.file.filename,
      Body: fileStream,
    };

    const s3Data = await s3.upload(uploadParams).promise();

    const newFile = new File({
      title,
      description,
      filename: req.file.originalname,
      metadata: req.file,
      s3Key: s3Data.Key,
    });

    await newFile.save();

    res.status(200).json({ message: 'File uploaded successfully', file: newFile });

    fs.unlinkSync(filePath);
  } catch (error) {
    fs.unlinkSync(filePath);
    res.status(500).json({ message: 'Error uploading file', error });
  }
});

// Endpoint to get uploaded files
app.get('/files', async (req, res) => {
  try {
    const files = await File.find({});
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching files', error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});