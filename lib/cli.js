/*
 * CLI-related tasks
 *
 */
//--------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------
const readline = require('readline')
const util = require('util')
const debug = util.debuglog('cli')
const events = require('events')
class _events extends events { }
const e = new _events()
const s3 = require('./s3')
const helpers = require('./helpers')
const path = require('path')

// Instantiate the cli module object
var cli = {}

// Event Handlers
e.on('exit', function () {
    process.exit(0)
})

e.on('help', function (str) {
    cli.responders.help(str)
})

e.on('buckets', function (str) {
    cli.responders.buckets(str)
})

e.on('upload', function (str) {
    cli.responders.upload(str)
})

//--------------------------------------------------------------------------------------------------
// Responder Objects
//--------------------------------------------------------------------------------------------------

cli.responders = {}

cli.responders.exit = function () {
    process.exit(0)
}

cli.responders.help = () => {
    const commands = {
        'exit': 'Kill the Application',
        'help': 'Show this help page',
        'buckets': 'List out all buckets',
        'buckets --name': 'Show keys in a bucket',
        'upload --b(bucket) --c(company) --f(filepath) --n(name) ': 'Upload file to S3 bucket with given parameters',
    }

    cli.format.heading('S3 Bucket Manual')

    // Print commands
    for (let key in commands) {
        if (commands.hasOwnProperty(key)) {
            const value = commands[key]
            let line = '\x1b[35m' + key + '\x1b[0m'
            const padding = 80 - line.length
            for (let index = 0; index < padding; index++) {
                line += ' '
            }
            line += commands[key]
            console.log(line)
        }
    }

    cli.format.verticalSpace(1)
    cli.format.horizontalLine(1)
    cli.format.verticalSpace(2)
}

cli.responders.buckets = async (str) => {
    cli.format.heading('Buckets List')
    console.log('Loading...')
    await s3.listAllBuckets()
}

cli.responders.upload = async (str) => {
    // Commands Required = Bucket Name, Company Name, File Name, Path Name
    cli.format.heading('Upload')

    try {
        const commands = helpers.getCommandsFromString(str)

        if (commands.error.length > 1) {
            throw new Error(commands.error)
        }

        if (!commands.b || !commands.c || !commands.f || !commands.n) {
            throw new Error('Important params are missing. See params list in help section!')
        }

        if (commands.b === 'NONE' || commands.c === 'NONE' || commands.f === 'NONE' || commands.n === 'NONE') {
            throw new Error('Important params are missing. See params list in help section!')
        }

        await s3.uploadToBucket(
            bucket = commands.b,
            company = commands.c,
            filePath = commands.f,
            name = commands.n
        )

    } catch (error) {
        console.error(error.message)
        cli.format.verticalSpace(1)
    }
}

//--------------------------------------------------------------------------------------------------
// CLI formatters
//--------------------------------------------------------------------------------------------------

cli.format = {}

cli.format.horizontalLine = function () {
    const width = process.stdout.columns

    let line = ''
    for (let index = 0; index < width; index++) {
        line += '-'
    }
    console.log(line)
}

cli.format.centered = function (str) {
    str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : ''

    const width = process.stdout.columns
    const padding = Math.floor((width - str.length) / 2)
    let line = ''
    for (let index = 0; index < padding; index++) {
        line += ' '
    }
    line += str
    console.log(line)
}

cli.format.verticalSpace = function (lines) {
    lines = typeof (lines) == 'number' && lines > 0 ? lines : 1
    for (let index = 0; index < lines; index++) {
        console.log('')
    }
}

cli.format.heading = (str) => {
    cli.format.verticalSpace(1)
    cli.format.horizontalLine()
    cli.format.centered(str)
    cli.format.horizontalLine()
    cli.format.verticalSpace(1)
}

//--------------------------------------------------------------------------------------------------
// Input processor
//--------------------------------------------------------------------------------------------------
cli.processInput = function (str) {
    str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : false
    // Only process the input if the user actually wrote something, otherwise ignore it
    if (str) {
        // Codify the unique strings that identify the different unique questions allowed be the asked
        var uniqueInputs = [
            'exit',
            'help',
            'buckets',
            'bucketdev',
            'upload'
        ]

        // Go through the possible inputs, emit event when a match is found
        var matchFound = false
        var counter = 0
        uniqueInputs.some(function (input) {
            if (str.toLowerCase().indexOf(input) > -1) {
                matchFound = true
                e.emit(input, str)
                return true
            }
        })

        if (!matchFound) {
            console.log("The command you entered doesn't exist!")
        }

    }
}

//--------------------------------------------------------------------------------------------------
// Init script
//--------------------------------------------------------------------------------------------------
cli.init = function () {

    // Send to console, in dark blue
    console.log('\x1b[34m%s\x1b[0m', 'The CLI is running')
    cli.responders.help()

    // Start the interface
    var _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '{s3} '
    })

    _interface.prompt()

    _interface.on('line', function (str) {
        cli.processInput(str)

        _interface.prompt()
    })

    _interface.on('close', function () {
        process.exit(0)
    })
}


// Export the module
module.exports = cli