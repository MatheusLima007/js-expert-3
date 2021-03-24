import ComponentsBuilder from "./components.js"
import { constants } from "./constants.js"

export default class TerminalController {
    #usersCollors = new Map()

    constructor() {}

    #pickCollor() {
        return `#${((1 << 24) * Math.random() | 0).toString(16)}-fg`
    }

    #getUserCollor(userName) {
        if(this.#usersCollors.has(userName)) return this.#usersCollors.get(userName)

        const collor = this.#pickCollor()
        this.#usersCollors.set(userName, collor)

        return collor
    }

    #onInputReceived(eventEmiter) {
        return function() {
            const message = this.getValue()
            console.log(message)
            this.clearValue()
        }
    }

    #onMessageReceived({ screen, chat }) {
        return msg => {
            const { userName, message } = msg
            const collor = this.#getUserCollor(userName)

            chat.addItem(`{${collor}}{bold}${userName}{/}: ${message}`)

            screen.render()
        }
    }

    #onLogChanged({ screen, activityLog }) {
        return msg => {
            const [userName] = msg.split(/\s/)
            const collor = this.#getUserCollor(userName)

            activityLog.addItem(`{${collor}}{bold}${msg.toString()}{/}`)

            screen.render()
        }
    }

    #onStatusChanged({ screen, status }) {
        return users => {
            const { content } = status.items.shift()
            status.clearItems()
            status.addItem(content)

            users.forEach(userName => {
                const collor = this.#getUserCollor(userName)
                status.addItem(`{${collor}}{bold}${userName}{/}`)
            });

            screen.render()
        }
    }

    #registerEvents(eventEmiter, components) {
        eventEmiter.on(constants.events.app.MESSAGE_RECEIVED, this.#onMessageReceived(components))
        eventEmiter.on(constants.events.app.ACTIVITYLOG_UPDATED, this.#onLogChanged(components))
        eventEmiter.on(constants.events.app.STATUS_UPDATED, this.#onStatusChanged(components))
    }

    async initializeTable(eventEmiter) {
        const components = new ComponentsBuilder()
            .setScreen({ title: 'HackerChat = Matheus Lima'})
            .setLayoutComponent()
            .setInputComponent(this.#onInputReceived(eventEmiter))
            .setChatComponent()
            .setActivityLogComponent()
            .setStatusComponent()
            .build()

        this.#registerEvents(eventEmiter, components)

        components.input.focus()
        components.screen.render()

        // // setInterval(() => {
        //     const users = ['matheus']
        //     eventEmiter.emit(constants.events.app.STATUS_UPDATED, users)
        //     users.push('1234')
        //     eventEmiter.emit(constants.events.app.STATUS_UPDATED, users)
        //     users.push('teste', 'teste2')
        //     eventEmiter.emit(constants.events.app.STATUS_UPDATED, users)
        //     users.push('aline', 'aline dois')
        //     eventEmiter.emit(constants.events.app.STATUS_UPDATED, users)
        // // }, 1000)
    }
}