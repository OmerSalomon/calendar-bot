const lib = require("./calendar.js");
import { Chat } from "whatsapp-web.js";
import { Contact } from "whatsapp-web.js";
import { Message } from "whatsapp-web.js";
 


class dateManager {
    static replaceCharsToSlash(string: string) {
        return string.replace(/[^a-zA-Z0-9]/g, '/');
    }    
    static formatDate(date: Date) { //create format date that make google api create all day event
        let d = new Date(date);
        let month = (d.getMonth() + 1).toString().padStart(2, '0');
        let day = d.getDate().toString().padStart(2, '0');
        let year = d.getFullYear();
        return [year, month, day].join('-');
    }
    static isInTheFuture(date: Date) {
        const today = new Date();
 
        // 👇️ OPTIONAL!
        // This line sets the time of the current date to the
        // last millisecond, so the comparison returns `true` only if
        // date is at least tomorrow
        today.setHours(23, 59, 59, 998);
 
        return date > today;
    }
 
    static stringDateToObject(string: string) {
        const dateString = this.replaceCharsToSlash(string);
        const date = new Date(dateString);
        console.log('date: ' + date);
        return date;
    }
 
}
 
class TimeObj {
    constructor( date:string ,  timeZone: string) {
        this.date = date;
        this.timeZone = timeZone;
    }
    date: string;
    timeZone: string;
}
 
class EventObj {
    constructor(summary: string, start: TimeObj, end: TimeObj, command?: Command) {
        this.summary = summary;
        this.start = start
        this.end = end
    }
    summary: string = 'Whatsapp event'; //need for now
    start: TimeObj;
    end: TimeObj;
 
    location: string = '';
    description: string = '';
    colorId: number = 2;
    timeZone: string = 'Asia/Jerusalem' //maybe dont work need to check
 
}
 
class Command {
    constructor(stringCommand: string, additionalTxt: string, message: Message) {
        this.stringCommand = stringCommand;
        this.additionalTxt = additionalTxt;
        this.message = message;
    }
    stringCommand: string;
    additionalTxt: string;
    message: Message;
 
    static commandBuilder(message: Message) {
        const message_body: string = message.body;
        const slicePoint = message_body.indexOf('!');
        const txtCommand = message_body.slice(0, slicePoint + 1);
        const additionalTxt = message_body.slice(slicePoint + 2);
        const command = new Command(txtCommand, additionalTxt, message);
        return command;
    }
} // contain every info that needed to operate any function
 
let lastChat: Chat;
 
 
//turn on the bot start
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { time } = require('console');
const client = new Client({
    authStrategy: new LocalAuth()
});
client.on('qr', (qr: any) => {
    qrcode.generate(qr, { small: true });
});
client.on('ready', () => {
    console.log('Client is ready!');
});
 
client.initialize();
//turn on the bot end
 
client.on('message_create', (message: Message) => {
    if (message.fromMe) {
        manager(message);
    }
});
 
 
async function manager(message: Message) {
    const command = await Command.commandBuilder(message);
    if (command.stringCommand == 'add!' || command.stringCommand == 'Add!' || command.stringCommand == 'a!') {
        addEvent(command);
    }
}
 
 
 
async function addEvent(command: Command) {
    lastChat = await command.message.getChat();
    const quotedMessage = await command.message.getQuotedMessage();
    let eventSummery: string = 'Whatsapp event';
    if (quotedMessage != null && quotedMessage.body != null) {
        eventSummery = quotedMessage.body;
       
        let num = parseInt(command.additionalTxt);
        if (num != NaN && num > 0) {
            const daysToAdd = Math.round(num);
            if (daysToAdd != null && daysToAdd > 0) {
                addEventWithDays(eventSummery, daysToAdd);
            }
        }
        else{
            const date = dateManager.stringDateToObject(command.additionalTxt);
            if (date.toDateString() != "Invalid Date") {
                if (dateManager.isInTheFuture(date)) {
                    addEventWithDate(eventSummery, date);
                }
                else{
                    command.message.reply('*CALENDAR:* The date is in the past event cant be added');
                }
            }
        }
    }
    else {
        command.message.reply('*CALENDAR:* please quote a message');
    }
    function addEventWithDate(eventSummery: string, startDate: Date) {
        const startTimeObj: TimeObj = new TimeObj(dateManager.formatDate(startDate), 'Asia/Jerusalem'); //full day event
        const endTimeObj: TimeObj = new TimeObj(dateManager.formatDate(startDate), 'Asia/Jerusalem');
        const eventObj: EventObj = new EventObj(eventSummery, startTimeObj, endTimeObj);
        lib.eventManagerGoogle.addEvent(eventObj);
    }




    function addEventWithDays(eventSummery: string, daysToAdd: number) {
        let startTime = new Date(); //create start time not object
        startTime.setDate(startTime.getDate() + daysToAdd);
        startTime.setHours(0, 0); //set the time to 00:00
 
        const endTime = new Date(startTime); //create end time not object
        endTime.setHours(23, 59); //set the time to 23:59
 
        const startTimeObj: TimeObj = new TimeObj(dateManager.formatDate(startTime), 'Asia/Jerusalem'); //create start time object
        const endTimeObj: TimeObj = new TimeObj(dateManager.formatDate(startTime), 'Asia/Jerusalem'); //create end time object
       
        const event = new EventObj(quotedMessage.body, startTimeObj, endTimeObj); //create event object
        lib.eventManagerGoogle.addEvent(event);
    }
 
}
 
lib.eventEmitter.on('busy', () => {
    if (lastChat != null) {
        lastChat.sendMessage('*CALENDAR:* Can not insert the event, other event is already exist in this time frame');
    }
 
})
 
lib.eventEmitter.on('event_added', () => {
    if (lastChat != null) {
        lastChat.sendMessage('*CALENDAR:* Event added');
    }
})
 
 
module.exports = { EventObj, TimeObj, Command };
 





