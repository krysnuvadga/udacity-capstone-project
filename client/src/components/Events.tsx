import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Label
} from 'semantic-ui-react'

import { createEvent, deleteEvent, getEvents, patchEvent } from '../api/events-api'
import Auth from '../auth/Auth'
import { Event } from '../types/Event'

interface EventsProps {
  auth: Auth
  history: History
}

interface EventsState {
  events: Event[]
  newEventName: string
  loadingEvents: boolean
}

export class Events extends React.PureComponent<EventsProps, EventsState> {
  state: EventsState = {
    events: [],
    newEventName: '',
    loadingEvents: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newEventName: event.target.value })
  }

  onEditButtonClick = (eventId: string) => {
    this.props.history.push(`/events/${eventId}/edit`)
  }

  onEventCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      if(this.state.newEventName == ""){
        alert('Please enter event name')
        return
      }
      const dueDate = this.calculateDueDate()
      const newEvent = await createEvent(this.props.auth.getIdToken(), {
        name: this.state.newEventName,
        dueDate
      })
      this.setState({
        events: [...this.state.events, newEvent],
        newEventName: ''
      })
    } catch {
      alert('Event creation failed')
    }
  }

  onEventDelete = async (eventId: string) => {
    try {
      await deleteEvent(this.props.auth.getIdToken(), eventId)
      this.setState({
        events: this.state.events.filter(event => event.eventId != eventId)
      })
    } catch {
      alert('Event deletion failed')
    }
  }

  onEventCheck = async (pos: number) => {
    try {
      const event = this.state.events[pos]
      await patchEvent(this.props.auth.getIdToken(), event.eventId, {
        name: event.name,
        dueDate: event.dueDate,
        status: !event.status
      })
      this.setState({
        events: update(this.state.events, {
          [pos]: { status: { $set: !event.staus } }
        })
      })
    } catch {
      alert('Event deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const events = await getEvents(this.props.auth.getIdToken())
      this.setState({
        events: events,
        loadingEvents: false
      })
    } catch (e) {
      alert(`Failed to fetch events: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Events</Header>

        {this.renderCreateEventInput()}

        {this.renderEvents()}
      </div>
    )
  }

  renderCreateEventInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onEventCreate
            }}
            fluid
            actionPosition="left"
            value={this.state.newEventName}
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderEvents() {
    if (this.state.loadingEvents) {
      return this.renderLoading()
    }

    return this.renderEventsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Events
        </Loader>
      </Grid.Row>
    )
  }

  renderEventsList() {
    return (
      <Grid padded>
        {this.state.events.map((event, pos) => {
          return (
            <Grid.Row key={event.eventId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onEventCheck(pos)}
                  checked={event.status}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {event.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {event.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(event.eventId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onEventDelete(event.eventId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {event.attachmentUrl && (
                <Image src={event.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
      
    )
  }

   

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
