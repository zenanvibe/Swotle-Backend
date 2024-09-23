const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const s3Client = new S3Client({
    endpoint: "https://blr1.digitaloceanspaces.com",
    forcePathStyle: false,
    region: "blr1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const uploadFile = async (req, res) => {
    try {
        const { folderPath, reason } = req.body;
        const file = req.file; // The uploaded file is accessible here

        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Generate a unique filename using UUID
        const uniqueId = uuidv4();
        const fileExtension = file.originalname.split('.').pop();
        const uniqueFileName = `${uniqueId}.${fileExtension}`;

        // Ensure folderPath is correctly formatted
        const finalFolderPath = folderPath ? `${folderPath}/${reason}/` : ''; // Add trailing slash if folderPath is provided

        const params = {
            Bucket: "whitelms-storage",
            Key: `${finalFolderPath}${uniqueFileName}`,
            Body: file.buffer,
            ACL: "public-read",
            ContentType: file.mimetype,
        };

        const upload = new Upload({
            client: s3Client,
            params: params,
        });

        const data = await upload.done();
        // console.log("Successfully uploaded object:", params.Bucket, "/", params.Key);

        return res.status(200).json({
            message: "File uploaded successfully",
            data: data,
            fileName: uniqueFileName // Return the unique filename
        });
    } catch (err) {
        console.error("Error uploading file:", err);
        return res.status(500).json({
            message: "File upload failed",
            error: err.message,
        });
    }
};

module.exports = {
    uploadFile,
};
    