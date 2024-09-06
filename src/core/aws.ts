import AWS from "aws-sdk"
import { S3Client } from "@aws-sdk/client-s3"
import { config } from "config"

const s3 = new AWS.S3({
    endpoint: config.URL_MINIO,
    accessKeyId: 'root',
    secretAccessKey: 'changemeplease123',
    s3ForcePathStyle: true
})

const s3_ = new S3Client({
    credentials: {
        accessKeyId: config.ACCESS_KEY_MINIO,
        secretAccessKey: config.SECRET_KEY_MINIO
    },
    endpoint: config.URL_MINIO,
    forcePathStyle: true
})

type S3 = typeof s3

export { s3, S3, s3_, S3Client }