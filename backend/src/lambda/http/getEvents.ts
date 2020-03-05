/// Imports
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { AuthHelper } from '../../helpers/authHelper'
import { EventsRepository } from '../../data/dataLayer/eventsRepository'
import { StorageHelper } from '../../helpers/storageHelper'
import { ResponseHelper } from '../../helpers/responseHelper'
import { createLogger } from '../../utils/logger'

/// Variables
const s3Helper = new StorageHelper()
const apiResponseHelper= new ResponseHelper()
const logger = createLogger('events')
const authHelper = new AuthHelper()

/**
 * Get authorized user events list
 * @param event API gateway Event
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
    // get user id using JWT from Authorization header
    const userId = authHelper.getUserId(event.headers['Authorization']) 
    logger.info(`get groups for user ${userId}`)

    // Get user's Events
    const result = await new EventsRepository().getUserEvents(userId)
    
    // Generate events pre-signed get url for events with uploaded images
    for(const record of result){
        if(record.hasImage){
            record.attachmentUrl = await s3Helper.getEventAttachmentUrl(record.eventId)
        }
    }

    // return success response
    return apiResponseHelper.generateDataSuccessResponse(200,'items',result)
}