import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
})

const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET

export async function uploadFileToS3(fileBuffer: Buffer, fileName: string, mimetype: string) {
  if (!S3_BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET environment variable is not set.")
  }

  const uploadParams = {
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
    ACL: "public-read", // Make the uploaded file publicly accessible
  }

  try {
    await s3Client.send(new PutObjectCommand(uploadParams))
    const fileUrl = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
    return fileUrl
  } catch (error) {
    console.error("Error uploading file to S3:", error)
    throw new Error("Failed to upload file to S3.")
  }
}

export async function getSignedUrlForDownload(fileName: string) {
  if (!S3_BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET environment variable is not set.")
  }

  const getParams = {
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
  }

  try {
    const command = new GetObjectCommand(getParams)
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // URL valid for 1 hour
    return url
  } catch (error) {
    console.error("Error getting signed URL from S3:", error)
    throw new Error("Failed to get signed URL from S3.")
  }
}

export async function deleteFileFromS3(fileName: string) {
  if (!S3_BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET environment variable is not set.")
  }

  const deleteParams = {
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
  }

  try {
    await s3Client.send(new DeleteObjectCommand(deleteParams))
    return { success: true, message: `File ${fileName} deleted successfully.` }
  } catch (error) {
    console.error("Error deleting file from S3:", error)
    throw new Error("Failed to delete file from S3.")
  }
}
