# Video and Audio Upload Application

This application allows users to upload video and audio files to an AWS S3 server using a MERN stack (MongoDB, Express.js, React.js, Node.js). It includes features such as file upload with metadata, file duration validation, and file compression for videos.

## Setup Instructions

### Prerequisites

1. **Node.js and npm**: Install Node.js and npm from [nodejs.org](https://nodejs.org/).

2. **MongoDB**: Install MongoDB locally or use MongoDB Atlas. Download MongoDB from [mongodb.com](https://www.mongodb.com/).

3. **AWS Account**: Sign in to the AWS Management Console: Go to [AWS Management Console](https://aws.amazon.com/console/). suppose you don't have one already. Configure AWS S3 to store uploaded files. Get your AWS Access Key ID and Secret Access Key. 

### Backend Setup

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/HoneyTyagii/video-audio-upload-application
   cd video-audio-upload-application/backend
   ```

2. **Install Dependencies**:

    `npm install`
    
3. **Environment Variables**:

   Create a .env file in the backend directory and add the following variables:
   ```bash
        PORT=5000 
        MONGODB_URI=<your-mongodb-uri>
        AWS_ACCESS_KEY_ID=<your-aws-access-key-id>
        AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>
        AWS_REGION=<your-aws-region>
        S3_BUCKET_NAME=<your-s3-bucket-name>
   ```

   Replace your-mongodb-uri, your-aws-access-key-id, your-aws-secret-access-key, your-aws-region, and your-s3-bucket-name with your MongoDB connection URI and AWS S3 bucket details.

4. **Start the Backend Server**:
   
   `node server.js`

   Your backend server should now be running on http://localhost:5000.

---

### Frontend Setup

1. Navigate to Frontend Directory: `cd ../frontend`
2. Install Dependencies: `npm install`
3. Start the Frontend Application: `npm start`

---
### Configuring AWS S3

1. Create an S3 Bucket:
   * Log in to the AWS Management Console.
   * Go to S3 service and click on "Create bucket".
   * Choose a unique bucket name and an AWS region.

2. Configure Bucket Permissions:
   * Navigate to your bucket in the AWS Management Console.
   * Go to the "Permissions" tab and configure permissions as needed (e.g., public/private access).

3. Set CORS Configuration:
   * Under the "Permissions" tab, click on "CORS configuration" and add rules to allow your frontend application to access the bucket.

4. Access Keys:
   * Generate or use existing AWS IAM access keys with permissions to access your S3 bucket. Update .env file with these keys.
  
---
### Configuring MongoDB

1. MongoDB Atlas (Cloud):
   * Create an account on MongoDB Atlas (or use another cloud provider).
   * Set up a cluster and obtain the MongoDB connection URI.
   * Update .env file with your MongoDB connection URI.

2. Local MongoDB Installation:
   * Install MongoDB locally.
   * Start MongoDB service (mongod command).
   * Use default settings or configure MongoDB as needed.
   * Update .env file with your local MongoDB connection URI.

---
### Running the Application

* With both backend and frontend servers running, open your browser and go to http://localhost:3000 to access the application.
* Upload video and audio files using the provided form, and monitor file upload progress and status.
