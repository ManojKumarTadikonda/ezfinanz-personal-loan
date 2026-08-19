const cloudinary = require("../config/cloudinary");

function uploadToCloudinary(
  buffer,
  options = {}
) {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder:
            options.folder ||
            "ezfinanz/selfies",

          resource_type: "image",

          public_id: options.publicId,

          transformation: [
            {
              width: 1200,
              height: 1200,
              crop: "limit"
            }
          ]
        },

        (error, result) => {
          if (error) {
            return reject(error);
          }

          resolve(result);
        }
      );

    uploadStream.end(buffer);
  });
}

module.exports = {
  uploadToCloudinary
};