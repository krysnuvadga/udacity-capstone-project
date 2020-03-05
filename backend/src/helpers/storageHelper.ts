import { XawsHelper} from "./xawsHelper"


/**
 * Common S3 functions
 */
export class StorageHelper{

    constructor(
        private readonly  s3:AWS.S3 = new XawsHelper().getS3(process.env.region,process.env.IMAGES_BUCKET) ,
          private readonly  signedUrlExpireSeconds = 60 * 5
    ){
        
    }

    /**
     * Generate attachment presigned Get-Url 
     * @param eventId Event id
     */
    async getEventAttachmentUrl(eventId: string): Promise<string>{
        try{
            await this.s3.headObject({
            Bucket: process.env.IMAGES_BUCKET,
            Key: `${eventId}.png` 
        }).promise();
        
        return  this.s3.getSignedUrl('getObject', {
            Bucket: process.env.IMAGES_BUCKET,
            Key: `${eventId}.png`,
            Expires: this.signedUrlExpireSeconds
            });
        }catch(err){
            console.log(err)
        }
        return null
    }

    /**
     * Generate attachment presigned Put-Url
     * @param eventId Event Id
     */
    getPresignedUrl(eventId: string): string{
        return this.s3.getSignedUrl('putObject', {
            Bucket: process.env.IMAGES_BUCKET,
            Key: `${eventId}.png`,
            Expires: this.signedUrlExpireSeconds
          }) as string ;
    }
}