const fs = require('fs')
const { promisify } = require('util')

methods = {}

methods.readFile = promisify(fs.readFile)

methods.getCommandsFromString = (str) => {
    const commands = str.split('--')

    commandsObject = {
        error: '',
        length: 0
    }

    if (commands.length == 1) {
        return {
            error: '',
            length: 1
        }
    }

    commands.forEach(element => {
        const params = element.trim().split(' ')
        if (params.length === 1) {
            params.push('NONE')
        }

        commandsObject.length += 1
        commandsObject[params[0]] = params[1]
    });

    return commandsObject
}

module.exports = methods