const EventEmitter = require('events')
const eventEmitter = new EventEmitter()


// Require google from googleapis package.
const { google } = require('googleapis')




// Require oAuth2 from our google instance.
const { OAuth2 } = google.auth


// Create a new instance of oAuth and set our Client ID & Client Secret.
const oAuth2Client = new OAuth2(
  '1067352759349-idfdcus8n0uv3rh5vkchh2dss29j1vbh.apps.googleusercontent.com',
  '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'
)


// Call the setCredentials method on our oAuth2Client instance and set our refresh token.
oAuth2Client.setCredentials({
  refresh_token: '1//04EeltuFj4FwuCgYIARAAGAQSNwF-L9Ir4ZmIDWhyz9LcxAD-cW8c9ebJE-LntPqp64Jsd8Jyzc7eGIdm13fak6vQ_LZBFdLHq0E',
})


// Create a new calender instance.
const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })







// Check if we a busy and have an event on our calendar for the same time.


class eventManagerGoogle {
  static async addEvent(eventToAdd) {
    calendar.events.insert(
      { calendarId: 'primary', resource: eventToAdd },
      (err) => {
        // Check for errors and log them if they exist.
        if (err) return console.error('Error Creating Calender Event:', err)
        // Else log that the event was created.
        eventEmitter.emit('event_added');
        return console.log('Calendar event successfully created.')
      }
    )
  }
}












module.exports = { eventManagerGoogle, eventEmitter }; //things that I can use in other files



