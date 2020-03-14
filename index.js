#!/usr/bin/env node
const ejs = require('ejs')
const fs = require('fs')
const path = require('path')
const { recursiveReadDir, logger } = require('./utils')

async function generate(component) {
    if (!component) {
        logger.error('Looks like you didnt specify template name!')
        logger.log('Usage: sg g templateName')
        return false
    }
    if (!fs.existsSync(`./.sg/${component}/`)) {
        logger.error(
            `Template folder for "${component}" not found (${path.resolve(
                `./.sg/${component}/`
            )})`
        )
        return false
    }
    if (!fs.existsSync(`./.sg/${component}/config.json`)) {
        logger.error(
            `Config not found (${path.resolve(`./.sg/${component}/config.json`)})`
        )
        return false
    }

    const config = JSON.parse(
        fs.readFileSync(`./.sg/${component}/config.json`).toString()
    )
    if (config.path === undefined) {
        logger.error('config.path does not exists')
        logger.error(config)
        return false
    }

    let questions = []
    for (let name of Object.keys(config.variables)) {
        let [type, defaultValue, description] = config.variables[name]
        let question
        switch (type) {
            case 'bool':
                question = {
                    type: 'confirm',
                    name,
                    message: description || `${name}?`,
                    default: defaultValue
                }
                break
            default:
                question = {
                    type: 'input',
                    name,
                    message: description || `${name}?`,
                    default: defaultValue
                }
                break
        }
        questions.push(question)
    }
    let answers = await logger.prompt(questions)
    console.log()

    if (!fs.existsSync(`./.sg/${component}/files`)) {
        logger.error(
            `Folder with template files not found (${path.resolve(
                `./.sg/${component}/files`
            )})`
        )
        return false
    }

    const files = recursiveReadDir(`./.sg/${component}/files`)
    const newFiles = []

    for (let file of files) {
        const template = fs.readFileSync(file).toString()

        let name = file.replace(
            /{\$([a-zA-Z0-9]+)}/gm,
            (_, varName) => answers[varName]
        )
        name = name.replace(
            path.resolve(`./.sg/${component}/files`),
            path.resolve(config.path)
        )
        if (name.endsWith('.ejs')) name = name.slice(0, name.length - 4)

        newFiles.push({
            name,
            content: ejs.render(template, answers)
        })
    }

    for (const el of newFiles) {
        const dirname = el.name.slice(0, el.name.lastIndexOf(path.sep))
        fs.mkdirSync(dirname, { recursive: true })
        if (fs.existsSync(el.name)) {
            logger.error('File exists - ', el.name)
            logger.error('Aborting')
            return false
        }
        fs.writeFileSync(el.name, el.content)
    }
}

const help = `
Directory structure:
.sg/                         -- Root directory
    MySuperComponent/        -- Template directory
        files/               -- Directory for template files
            {$foo}.css       -- Template files. You can use variables in file name, with {$var} syntax.
            {$bar}.js.ejs    -- Template files. All files are processed with ejs.
        config.json          -- Config

config.json structure:
{
    "path": "components",
    "variables": {
        "foo": ["string", "Bar", "What should foo value be?"]
    }
}

path - output folder
variables - array of variables available in template.
    Key - variable name
    Value - array of one or more elements:
        1. Variable type (bool/string for now)
        2. Default value
        3. Prompt
`

switch(process.argv[2]) {
    case 'g':
    case 'generate':
        generate(process.argv[3])
        break
    case 'help':
        logger.log('Available commands:')
        logger.log('    generate [g] - generate from template')
        logger.log('    help - shows help )')
        logger.log(help)
        break
    default:
        logger.error('Unknown command')
        logger.log('Available commands:')
        logger.log('    generate [g] - generate from template')
        logger.log('    help - shows help )')
}