/// Imports
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { AuthHelper } from '../../helpers/authHelper'
import { UpdateEventRequest } from '../../requests/updateEventRequest'
import { EventsRepository } from '../../data/dataLayer/eventsRepository'
import { ResponseHelper } from '../../helpers/responseHelper'
import { createLogger } from '../../utils/logger'

/// Variables
const logger = createLogger('events')
const eventsAccess = new EventsRepository()
const apiResponseHelper = new ResponseHelper()
const authHelper = new AuthHelper()

/**
 * Update existing event belong to authorized user
 * @param event API getway event
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
    // get event id from path parameters
    const eventId = event.pathParameters.eventId

    //Extract update fields from event body
    const updatedEvent: UpdateEventRequest = JSON.parse(event.body)
    
    // get user id using JWT from Authorization header
    const userId = authHelper.getUserId(event.headers['Authorization'])
  
    // get event item if any
    const item = await eventsAccess.getEventById(eventId)
  
    // validate event already exists
    if(item.Count == 0){
        logger.error(`user ${userId} requesting update for non exists event with id ${eventId}`)
        return apiResponseHelper.generateErrorResponse(400,'Event not exists')
    } 

    // validate event belong to authorized user
    if(item.Items[0].userId !== userId){
        logger.error(`user ${userId} requesting update event does not belong to his account with id ${eventId}`)
        return apiResponseHelper.generateErrorResponse(400,'Event does not belong to authorized user')
    }

    logger.info(`User ${userId} updating group ${eventId} to be ${updatedEvent}`)

    // update event 
    await new EventsRepository().updateEvent(updatedEvent,eventId)

    return apiResponseHelper.generateEmptySuccessResponse(204)
}
