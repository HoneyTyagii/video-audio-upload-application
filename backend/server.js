const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB setup
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema for uploaded files
const fileSchema = new mongoose.Schema({
  title: String,
  description: String,
  s3Key: String,
  s3Url: String,
  uploadDate: Date,
});
const File = mongoose.model('File', fileSchema);

const upload = multer({ dest: 'uploads/' });

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const compressVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions('-vcodec libx264')
      .outputOptions('-crf 28')
      .save(outputPath)
      .on('end', () => {
        console.log('Video compression finished');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Error during video compression', err);
        reject(err);
      });
  });
};

app.post('/upload', upload.single('file'), async (req, res) => {
  const { title, description } = req.body;
  const file = req.file;

  const inputFilePath = path.join(__dirname, file.path);
  const outputFilePath = path.join(__dirname, 'compressed_' + file.filename + path.extname(file.originalname));

  try {
    // Compress the video
    console.log('Starting video compression');
    await compressVideo(inputFilePath, outputFilePath);

    // Upload the compressed video to S3
    console.log('Uploading compressed video to S3');
    const fileContent = fs.readFileSync(outputFilePath);
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `uploads/${Date.now()}_${file.originalname}`,
      Body: fileContent,
      ContentType: file.mimetype,
    };

    const data = await s3.upload(params).promise();

    // Delete the local files
    fs.unlinkSync(inputFilePath);
    fs.unlinkSync(outputFilePath);

    // Save metadata to MongoDB
    const newFile = new File({
      title,
      description,
      s3Key: data.Key,
      s3Url: data.Location,
      uploadDate: new Date(),
    });

    await newFile.save();

    res.status(200).json({ message: 'File uploaded and compressed successfully', file: newFile });
  } catch (error) {
    console.error('Error uploading file', error);
    res.status(500).json({ message: 'Error uploading file', error });
  }
});

app.get('/files', async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching files', error });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
