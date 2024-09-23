const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

dotenv.config();

// S3 setup for DigitalOcean Spaces
const spacesEndpoint = { endpoint: 'https://blr1.digitaloceanspaces.com' };
const s3 = new S3Client({
    forcePathStyle: false,
    region: 'blr1',
    endpoint: spacesEndpoint.endpoint,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const uploadOnline = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'neptunezen', // Replace with your bucket name
        acl: 'public-read',
        key: function (request, file, cb) {
           
            const folderPath = 'zenanvibe/swotle/';
            
            cb(null, folderPath + Date.now() + '_' + file.originalname); // Using timestamp to prevent name collision
        },
    }),
});



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads'); // Define your local upload directory
    },
    filename: function (req, file, cb) {
        const uniquePrefix = Date.now() + '-';
        cb(null, uniquePrefix + file.originalname); // Unique filename to prevent overwriting
    }
});

const uploadOffline = multer({ storage: storage });

module.exports = {uploadOffline,uploadOnline};
