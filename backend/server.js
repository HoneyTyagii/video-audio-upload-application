// Require necessary modules
require('dotenv').config(); 
const express = require('express'); 
const mongoose = require('mongoose'); 
const multer = require('multer'); 
const aws = require('aws-sdk'); 
const multerS3 = require('multer-s3'); 
const ffmpeg = require('fluent-ffmpeg'); 
const { createReadStream, createWriteStream, unlink } = require('fs'); 
const { promisify } = require('util'); 
const path = require('path'); 

// Promisify unlink function from fs module
const unlinkAsync = promisify(unlink);

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB', err));

// Initialize AWS S3
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // AWS Access Key ID
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // AWS Secret Access Key
  region: process.env.AWS_REGION, // AWS Region
});

// Configure Multer-S3 for file uploads to S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME, // Name of your S3 bucket
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + path.extname(file.originalname)); // Set key (filename) for the uploaded file
    },
  }),
});

// Define MongoDB schema for file metadata
const fileSchema = new mongoose.Schema({
  title: String,
  description: String,
  s3Url: String,
  metadata: mongoose.Schema.Types.Mixed,
});

// Create File model using fileSchema
const File = mongoose.model('File', fileSchema);

// POST endpoint for uploading files
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, description } = req.body; // Extract title and description from request body
    const file = req.file; // Uploaded file information

    const tempFilePath = path.join(__dirname, 'temp', file.key);
    const writeStream = createWriteStream(tempFilePath);
    s3.getObject({ Bucket: process.env.S3_BUCKET_NAME, Key: file.key }).createReadStream().pipe(writeStream);

    writeStream.on('finish', () => {
      ffmpeg.ffprobe(tempFilePath, async (err, metadata) => {
        if (err) {
          return res.status(500).json({ error: 'Error processing file' });
        }

        const duration = metadata.format.duration; // Get file duration
        if (duration > 1800) { // Check if duration exceeds 30 minutes (1800 seconds)
          await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: file.key }).promise(); 
          await unlinkAsync(tempFilePath);
          return res.status(400).json({ error: 'File exceeds the 30-minute duration limit' }); // Send error response
        }

        // Compress video
        const compressedFilePath = path.join(__dirname, 'temp', 'compressed_' + file.key); // Compressed file path
        ffmpeg(tempFilePath)
          .output(compressedFilePath)
          .videoCodec('libx264')
          .size('1280x720')
          .on('end', async () => {
            const compressedFile = createReadStream(compressedFilePath); 

            // Upload compressed file to S3
            await s3.upload({
              Bucket: process.env.S3_BUCKET_NAME,
              Key: 'compressed_' + file.key,
              Body: compressedFile,
            }).promise();

            // Save file metadata to MongoDB
            const newFile = new File({
              title,
              description,
              s3Url: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/compressed_${file.key}`,
              metadata: metadata,
            });
            await newFile.save(); // Save file metadata

            // Clean up temporary files
            await unlinkAsync(tempFilePath);
            await unlinkAsync(compressedFilePath);

            res.status(201).json(newFile); // Send success response with saved file metadata
          })
          .on('error', (err) => {
            console.error('Error compressing video', err);
            res.status(500).json({ error: 'Error compressing video' });
          })
          .run(); // Run ffmpeg command
      });
    });
  } catch (error) {
    console.error('Error uploading file', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

// GET endpoint to fetch all files
app.get('/files', async (req, res) => {
  try {
    const files = await File.find(); // Retrieve all files from MongoDB
    res.json(files); // Send JSON response with files
  } catch (error) {
    console.error('Error fetching files', error);
    res.status(500).json({ error: 'Error fetching files' });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
