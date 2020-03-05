/// Imports
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { StorageHelper } from '../../helpers/storageHelper';
import { ResponseHelper } from '../../helpers/responseHelper';
import { EventsRepository } from '../../data/dataLayer/eventsRepository'
import { AuthHelper } from '../../helpers/authHelper'
import { createLogger } from '../../utils/logger'


// Variables
const eventsAccess = new EventsRepository()
const apiResponseHelper = new ResponseHelper()
const logger = createLogger('event')
const authHelper = new AuthHelper()


/**
 * Generate upload pre-signed url for event image upload
 * @param event API getway Event
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    
    // get event id from path parameters
    const eventId = event.pathParameters.eventId
    
    // get user id using JWT from Authorization header
    const userId = authHelper.getUserId(event.headers['Authorization'])
 
    // get event item if any
    const item = await eventsAccess.getEventById(eventId)

    // validate event already exists
    if(item.Count == 0){
        logger.error(`user ${userId} requesting put url for non exists event with id ${eventId}`)
        return apiResponseHelper.generateErrorResponse(400,'Event not exists')
    }

    // validate event belong to authorized user
    if(item.Items[0].userId !== userId){
        logger.error(`user ${userId} requesting put url event does not belong to his account with id ${eventId}`)
        return apiResponseHelper.generateErrorResponse(400,'Event does not belong to authorized user')
    }
    
    // Generate S3 pre-signed url for this event
    const url = new StorageHelper().getPresignedUrl(eventId)

    
    return apiResponseHelper
            .generateDataSuccessResponse(200,"uploadUrl",url)
}
