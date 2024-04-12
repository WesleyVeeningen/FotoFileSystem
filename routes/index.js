const express = require('express');
const router = express.Router();
const File = require('../models/file');
const Folder = require('../models/folder');
const Persoon = require('../models/personen');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // Import sharp for image processing
const { isArray } = require('util');

router.get('/', function (req, res, next) {
  res.redirect('/home');
});

// GET home page
router.get('/home', async function (req, res, next) {
  res.redirect('/files');
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



// Display file upload form
// Display file upload form
router.get('/files', async (req, res, next) => {
  if (!req.session.username) {
    return res.redirect('/auth/login');
  }
  try {
    // Fetch file information from MongoDB
    const folders = await Folder.find({});
    let files = await File.find({ folder: "home" }); // Fetch files for the logged-in user only

    // Calculate total file size before deletion
    let totalFileSizeBytes = 0;
    files.forEach(file => {
      totalFileSizeBytes += file.size;
    });
    const totalFileSizeMB = (totalFileSizeBytes / (1024 * 1024)).toFixed(2);


    // Render the template with both folders and files data
    res.render('files', { title: 'Upload File', username: req.session.username, folders, files, totalFileSizeMB });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Define a route to calculate the total file size
router.get('/files/totalFileSize', async (req, res) => {
  try {
    // Fetch files for the logged-in user only
    const files = await File.find({});

    // Calculate total file size in bytes
    let totalFileSizeBytes = 0;
    files.forEach(file => {
      totalFileSizeBytes += file.size;
    });

    // Convert total file size to megabytes
    const totalFileSizeMB = totalFileSizeBytes / (1024 * 1024);

    // Send the total file size as a response
    res.json({ success: true, totalFileSizeMB });
  } catch (error) {
    console.error('Error calculating total file size:', error);
    res.status(500).json({ success: false, message: 'An error occurred while calculating the total file size' });
  }
});




// Ensure the existence of the temporary folder
const tempFolderPath = path.join(__dirname, '../public/temp');
if (!fs.existsSync(tempFolderPath)) {
  fs.mkdirSync(tempFolderPath, { recursive: true });
}

// Initialize multer with the storage options for temporary upload
// Initialize multer with the storage options for temporary upload
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/temp'); // Store files in the 'temp' directory within the 'public' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename
  }
});


// Multer storage for temporary upload
const uploadTemp = multer({ storage: tempStorage });

// POST route to handle file uploads (images, videos, and audios)
// POST route to handle file uploads (images, videos, and audios)
// POST route to handle file uploads (images, videos, and audios)
router.post('/files', uploadTemp.array('files[]'), async (req, res, next) => {

  try {
    console.log('Files uploaded:', req.files);

    // Initialize an array to store fileInfo objects
    const fileInfoArray = [];

    // Loop through each uploaded file
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const fileType = file.mimetype;

      // Check if the uploaded file is an image, video, or audio
      if (!fileType.startsWith('image') && !fileType.startsWith('video') && !fileType.startsWith('audio')) {
        return res.status(400).send('Unsupported file type.');
      }

      // Get the filename and path of the uploaded file
      const fileName = file.originalname;
      const filePath = file.path;

      console.log('File uploaded:', fileName);

      // Get file information
      const fileInfo = {
        name: fileName,
        type: fileType,
        size: file.size,
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

      // Push the fileInfo object to the array
      fileInfoArray.push(fileInfo);
    }

    // Fetch folders from MongoDB
    const folders = await Folder.find({});
    const personen = await Persoon.find();

    console.log('File Info Array:', fileInfoArray);
    // Render EJS view with file information and folder options
    res.render('./components/FileForm', { fileInfo: fileInfoArray, user: req.session.username, folders, personen });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/moveFile', async (req, res) => {
  if (!req.session.username) {
    return res.redirect('/auth/login');
  }
});

router.post('/moveFile', async (req, res) => {
  // Destructure arrays from req.body
  const { fileName, fileSize, fileType, filecreatedAt, fileoriginDate, folderName, bio } = req.body;

  try {
    // Iterate through each file provided in the request
    for (let i = 0; i < fileName.length; i++) {
      // Check if folderName is provided for the file
      if (!folderName[0]) {
        throw new Error('Folder name is missing for file: ' + fileName[i]);
      }

      console.log('Moving file:', bio[i]);

      const file = {
        fileName: fileName[i],
        fileSize: fileSize[i],
        fileType: fileType[i],
        filecreatedAt: filecreatedAt[i],
        fileoriginDate: fileoriginDate[i],
        folderName: folderName[i],
        bio: bio[i],
      };

      // Create new file object using mongoose model
      const newFile = new File({
        name: file.fileName,
        size: file.fileSize,
        fileType: file.fileType,
        createdAt: file.filecreatedAt,
        originDate: file.fileoriginDate,
        folder: file.folderName,
        user: req.session.username,
        bio: file.bio,
      });
      // Save the file object to the database
      await newFile.save();

      // Construct file paths
      const tempFilePath = path.join(__dirname, '../public/temp', file.fileName);
      const destinationFolderPath = path.join(__dirname, '../public/uploads', file.folderName);
      const destinationFilePath = path.join(destinationFolderPath, file.fileName);

      // Create destination folder if it doesn't exist
      if (!fs.existsSync(destinationFolderPath)) {
        fs.mkdirSync(destinationFolderPath, { recursive: true });
      }

      // Move the original file to the destination folder
      fs.renameSync(tempFilePath, destinationFilePath);

      // Create thumbnail folder within the destination folder if it doesn't exist
      const thumbnailFolderPath = path.join(destinationFolderPath, 'thumbnail');
      if (!fs.existsSync(thumbnailFolderPath)) {
        fs.mkdirSync(thumbnailFolderPath, { recursive: true });
      }

      // Create thumbnail file path
      const thumbnailFileName = 'thumbnail_' + file.fileName; // Prefix with 'thumbnail_'
      const thumbnailFilePath = path.join(thumbnailFolderPath, thumbnailFileName);

      // Generate thumbnail using Sharp
      await sharp(destinationFilePath)
        .resize(100) // Specify the width of the thumbnail
        .toFile(thumbnailFilePath);

      // Log success message
      console.log('File moved and saved successfully:', file.fileName);
    }

    // Redirect to the files page or send a success response
    res.redirect('/files');
  } catch (error) {
    // Handle errors
    console.error('Error moving files:', error.message);
    res.status(400).send('Error moving files: ' + error.message);
  }
});






// POST route to move the file to the specified folder


// Assuming you have routes set up in your Express.js app
// POST route to handle adding a new folder
router.post('/folders', async (req, res) => {
  const { name, username } = req.body;
  if (!name || !username) {
    return res.status(400).json({ success: false, message: 'Invalid folder name or username' });
  }

  // Check if folder name contains special characters
  const folderNameRegex = /^[a-zA-Z0-9-_]+$/; // Only allow alphanumeric characters, hyphen, and underscore
  if (!folderNameRegex.test(name)) {
    return res.status(400).json({ success: false, message: 'Invalid folder name. Only alphanumeric characters, hyphen, and underscore are allowed.' });
  }

  const newFolder = new Folder({ name, user: username });
  await newFolder.save();
  console.log('Folder added:', newFolder);
  if (!newFolder) {
    return res.status(400).json({ success: false, message: 'Failed to add folder' });
  }
  const folders = await Folder.find({ user: username });

  const fileFolderFind = await File.find({ folder: "home" });

  const infolder = await Folder.find({ name: fileFolderFind });

  res.json({ success: true, message: 'Folder added successfully', folders, infolder });
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
    const thumbnailPath = path.join(__dirname, `../public/uploads/${deletedFile.folder}/thumbnail/thumbnail_${deletedFile.name}`);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }

    // Delete the file from the database
    await File.findByIdAndDelete(fileId);

    // Recalculate total file size after deletion
    let totalFileSizeBytes = 0;
    const files = await File.find({ user: req.session.username });
    files.forEach(file => {
      totalFileSizeBytes += file.size;
    });
    const totalFileSizeMB = (totalFileSizeBytes / (1024 * 1024)).toFixed(2);

    res.json({ success: true, message: 'File deleted successfully.', totalFileSizeMB });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



module.exports = router;
