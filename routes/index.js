const express = require('express');
const router = express.Router();
const File = require('../models/file');
const Folder = require('../models/folder');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // Import sharp for image processing

router.get('/', function (req, res, next) {
  res.redirect('/home');
});

// GET home page
router.get('/home', async function (req, res, next) {
  res.render('index', { title: 'Express', username: req.session.username });

});


// Display file upload form
router.get('/files/:folderName', async (req, res) => {
  try {
    const folderName = req.params.folderName;

    // Find files belonging to the specified folder
    const files = await File.find({ folder: folderName });

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Other routes...

module.exports = router;


// Display file upload form
// Display file upload form
router.get('/files', async (req, res, next) => {

  try {
    // Fetch file information from MongoDB
    const folders = await Folder.find();
    const files = await File.find();
    res.render('files', { title: 'Upload File', username: req.session.username, folders, files });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// Ensure the existence of the temporary folder
const tempFolderPath = path.join(__dirname, '../public/temp');
if (!fs.existsSync(tempFolderPath)) {
  fs.mkdirSync(tempFolderPath, { recursive: true });
}

// Initialize multer with the storage options for temporary upload
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/temp'); // Store files in the 'temp' directory within the 'public' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename
  }
});
const uploadTemp = multer({ storage: tempStorage });


router.post('/files', uploadTemp.single('foto'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Check if the uploaded file is an image or video
    if (!req.file.mimetype.startsWith('image') && !req.file.mimetype.startsWith('video')) {
      return res.status(400).send('Unsupported file type.');
    }

    // Get the filename and path of the uploaded file
    const fileName = req.file.originalname;
    const filePath = req.file.path;

    console.log('File uploaded:', fileName);

    // Get file information
    const fileInfo = {
      name: fileName,
      type: req.file.mimetype,
      size: req.file.size,
      createdAt: new Date(), // Default to the current date
      originDate: new Date(), // Default to the current date
    };

    // Get the creation date of the uploaded file
    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error('Error getting file stats:', err);
      } else {
        // Use the birthtime (creation time) of the file as the origin date
        fileInfo.originDate = stats.birthtime;
        console.log('File creation date:', fileInfo.originDate);
      }
    });

    // Fetch folders from MongoDB
    const folders = await Folder.find();

    // Create upload directories for each folder
    folders.forEach(async (folder) => {
      const uploadDir = path.join(__dirname, `../public/uploads/${folder.name}`);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Create thumbnails directory within the upload directory if it doesn't exist
      const thumbnailsDir = path.join(uploadDir, 'thumbnails');
      if (!fs.existsSync(thumbnailsDir)) {
        fs.mkdirSync(thumbnailsDir);
      }

      // Create a thumbnail
      const thumbnailPath = path.join(thumbnailsDir, fileName);
      await sharp(filePath)
        .resize({ width: 200 }) // Adjust the width of the thumbnail as needed
        .toFile(thumbnailPath);
    });

    // Render EJS view with file information and folder options
    res.render('./components/FileForm', { fileInfo, folders });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});





// POST route to move the file to the specified folder

router.post('/moveFile', async (req, res) => {
  try {
    const { folder, fileName, fileType, fileSize, fileCreatedAt, originDate } = req.body; // Extract file information from the request body
    console.log('Folder:', folder);
    const tempFileName = fileName; // Assuming the file extension is .png
    const tempFilePath = path.join(__dirname, '../public/temp', tempFileName);

    // Check if the folder name is defined
    if (!folder) {
      console.log('Folder name is undefined');
      return res.status(400).send('Folder name is undefined.');
    }

    const targetFolder = path.join(__dirname, `../public/uploads/${folder}`);

    // Check if the file exists in the temporary folder
    if (!fs.existsSync(tempFilePath)) {
      console.log(tempFilePath + ' not found');
      return res.status(400).send('File not found in temporary folder.');
    }

    // Move the file from the temporary folder to the specified folder
    fs.renameSync(tempFilePath, path.join(targetFolder, tempFileName));

    // Create a thumbnail directory within the target folder if it doesn't exist
    const thumbnailDir = path.join(targetFolder, 'thumbnails');
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir);
    }

    // Create a thumbnail path within the thumbnail directory
    const thumbnailPath = path.join(thumbnailDir, tempFileName);

    // Create a thumbnail of the moved file
    await sharp(path.join(targetFolder, tempFileName))
      .resize({ width: 200 }) // Adjust the width of the thumbnail as needed
      .toFile(thumbnailPath);

    // Convert fileSize to a number
    const size = parseInt(fileSize, 10);

    // Create a new File document and save it to the database
    const newFile = new File({
      name: fileName,
      fileType: fileType,
      size: size,
      createdAt: fileCreatedAt,
      originDate: originDate,
      folder: folder,
      // Set other properties as needed, such as uploadDate, originDate, and user
    });
    await newFile.save();

    // Redirect to some page after moving the file
    res.redirect('/files');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;

    // Find the file by ID
    const deletedFile = await File.findById(fileId);

    if (!deletedFile) {
      return res.status(404).json({ success: false, message: 'File not found.' });
    }

    // Delete the image file from the folder
    const imagePath = path.join(__dirname, `../public/uploads/${deletedFile.folder}/${deletedFile.name}`);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete the thumbnail from the thumbnails folder
    const thumbnailPath = path.join(__dirname, `../public/uploads/${deletedFile.folder}/thumbnails/${deletedFile.name}`);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }

    // Delete the file from the database
    await File.findByIdAndDelete(fileId);

    res.json({ success: true, message: 'File deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});





module.exports = router;
