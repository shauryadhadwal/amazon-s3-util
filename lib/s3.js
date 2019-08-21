// Load the SDK and UUID
const AWS = require('aws-sdk')
const uuid = require('uuid')
const util = require('./helpers')

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
})

const S3 = new AWS.S3()

const methods = {}

methods.listAllBuckets = async () => {
    const response = await S3.listBuckets().promise()
    try {
        response.Buckets.forEach(element => {
            console.log(element.Name)
        });
    }
    catch (error) {
        console.error(error)
    }
}

methods.listObjectsInBucket = (bucketName) => {
    const params = {
        Bucket: bucketName,
    }

    S3.listObjectsV2(params, (error, data) => {
        if (error) {
            console.error(error)
        }
        else {
            console.log(data)
        }
    })
}

methods.uploadToBucket = async (bucket, company, filePath, name) => {

    try {
        const fileStream = await util.readFile(filePath)

        const key = company + '/' + name

        const params = {
            ACL: 'public-read',
            Bucket: bucket,
            Body: fileStream,
            Key: key
        }

        const response = await S3.upload(params).promise()
        console.log('Upload Successful!')
        console.log('Bucket: ' + response.Bucket)
        console.log('Key: ' + response.Key)

    } catch (error) {
        throw new Error(error)
    }
}

module.exports = methods

/* References
https://stackoverflow.com/questions/19459893/how-to-create-folder-or-key-on-s3-using-aws-sdk-for-node-js
*/