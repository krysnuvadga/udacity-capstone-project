/// Imports
import 'source-map-support/register'
import { S3Event,S3Handler } from 'aws-lambda'
import { EventsRepository } from '../../data/dataLayer/eventsRepository'
import { createLogger } from '../../utils/logger'

/// Variables
const logger = createLogger('events')
const eventsAccess = new EventsRepository()

/**
 * Get authorized user events list
 * @param event API gateway Event
 */
export const handler: S3Handler = async (event: S3Event): Promise<void> => {
    const fileName = event.Records[0].s3.object.key
    logger.info(`File uploaded ${fileName}`)
    //authHeader.split(' ')
    const eventId =  fileName.split('.')[0]
    const item = await eventsAccess.getEventById(eventId)
    if(item.Count == 1){
        await eventsAccess.updateEventImageFlag(eventId)
    }else{
        logger.error(`File uploaded ${fileName} not matching an event`)
    }
}