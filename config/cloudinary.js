const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: 'dspp2vqid',
  api_key: '581164154953131',
  api_secret: 'psAsLwqSkCoBgt2_i4Yi18y5ZL4',
  secure: true
});

module.exports = cloudinary;