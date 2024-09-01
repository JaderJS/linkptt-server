import AWS from "aws-sdk"
import { config } from "config"

const s3 = new AWS.S3({
    endpoint: config.URL_MINIO,
    accessKeyId: 'root',
    secretAccessKey: 'changemeplease123',
    s3ForcePathStyle: true
})