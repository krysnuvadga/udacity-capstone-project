/// Imports
import { EventItem } from "../models/event";
import { CreateEventRequest } from "../../requests/createEventRequest";
import { UpdateEventRequest } from "../../requests/updateEventRequest";
import { XawsHelper} from "../../helpers/xawsHelper"
import { createLogger } from '../../utils/logger'

/// Variables
const logger = createLogger('events')
const uuid = require('uuid/v4')
const xaws = new XawsHelper()

/**
 * Events repository for Event's CURD operations
 */
export class EventsRepository{
    constructor(
        private readonly docClient = xaws.getDocumentClient(),
        private readonly eventsTable = process.env.EVENT_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX
    )
        {}

    /**
     * Get authorized user events list
     * @param userId Authorized user id
     */
    async getUserEvents(userId: string): Promise<EventItem[]>{
        const param = {
            TableName: this.eventsTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues:{
                ':userId':userId
            },
            Limit: 5
        }
        
        const dataResult = await this.docClient
                                        .query(param)
                                        .promise()
        return dataResult.Items as EventItem[]
    }

    /**
     * Create new Event Item
     * @param request Create event data
     * @param userId Logged user id
     */
    async createEvent(request: CreateEventRequest,userId: string): Promise<EventItem>{
        const item:EventItem = {
            userId: userId,
            eventId: uuid(),
            createdAt: new Date().toISOString(),
            name: request.name,
            dueDate: request.dueDate,
            status: false,
            hasImage: false
        }
        await this.docClient.put({
            TableName: this.eventsTable,
            Item: item
        }).promise()
        return item
    }
    
    
    /**
     * Get Event record by Id
     * @param id Event Id
     */
    async getEventById(id: string): Promise<AWS.DynamoDB.QueryOutput>{
        return await this.docClient.query({
            TableName: this.eventsTable,
            KeyConditionExpression: 'eventId = :eventId',
            ExpressionAttributeValues:{
                ':eventId': id
            }
        }).promise()
    }

    async updateEventImageFlag(eventId:string){
        await this.docClient.update({
            TableName: this.eventsTable,
            Key:{
                'eventId':eventId
            },
            UpdateExpression: 'set  hasImage = :t',
            ExpressionAttributeValues: {
                ':t' : true
            }
          }).promise()
    }

    /**
     * Update existing Event record
     * @param updatedEvent Update field details
     * @param eventId Event Id
     */
    async updateEvent(updatedEvent:UpdateEventRequest,eventId:string){
        await this.docClient.update({
            TableName: this.eventsTable,
            Key:{
                'eventId':eventId
            },
            UpdateExpression: 'set #namefield = :n, dueDate = :d, status = :status',
            ExpressionAttributeValues: {
                ':n' : updatedEvent.name,
                ':d' : updatedEvent.dueDate,
                ':status' : updatedEvent.status
            },
            ExpressionAttributeNames:{
                "#namefield": "name"
              }
          }).promise()
    }


    /**
     * Delete Event record
     * @param eventId Event Id
     */
    async deleteEventById(eventId: string){
        const param = {
            TableName: this.eventsTable,
            Key:{
                "eventId":eventId
            }
        }
         await this.docClient.delete(param).promise()
    }
    
}