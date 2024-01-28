import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        // console.log("File is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteOnCloudinary = async (fileUrl) => {

    try {
        if (!fileUrl) return null
        // delete on cloudinary

        // Extract public ID from the URL
        const publicId = cloudinary.url(fileUrl).split('/').pop().replace(/\.[^/.]+$/, '');
        // const publicId = cloudinary.url(fileUrl, { fetch_format: "auto" }).split('/').pop().replace(/\.[^/.]+$/, '');

        const parts = fileUrl.split('/');
        const resourceTypeIndex = parts.indexOf('upload') - 1;

        let resourceType;
        // getting resource type i.e image or video
        if (resourceTypeIndex >= 0 && resourceTypeIndex < parts.length) {
            resourceType = parts[resourceTypeIndex];
        }
        // console.log("type: ", typeof(resourceType))

        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
        // file removed successfully
        // console.log("Result: ", result)
        // Result:  { result: 'ok' }

        return result;

    } catch (error) {
        console.log("Error message: ", error.message)
        return null
    }
}

export { uploadOnCloudinary, deleteOnCloudinary }

