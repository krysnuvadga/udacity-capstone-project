/// Imports
import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateEventRequest } from '../../requests/createEventRequest'
import { AuthHelper } from '../../helpers/authHelper'
import { EventsRepository } from '../../data/dataLayer/eventsRepository'
import { ResponseHelper } from '../../helpers/responseHelper'
import { createLogger } from '../../utils/logger'


/// Variables
const logger = createLogger('event')
const authHelper = new AuthHelper()

/**
 * Create new Event Item
 * @param event API gateway event
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
    // parse event field from event body
    const newEvent: CreateEventRequest = JSON.parse(event.body)

    // get user id using JWT from Authorization header
    const userId = authHelper.getUserId(event.headers['Authorization'])
    logger.info(`create event for user ${userId} with data ${newEvent}`)

    // Save event item to database
    const item = await new EventsRepository()
                            .createEvent(newEvent,userId)

    // return success response                            
    return new ResponseHelper()
                .generateDataSuccessResponse(201,'item',item)

}
