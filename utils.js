const inquirer = require('inquirer')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

const logger = {
    ...inquirer,
    log: console.log,
    error: (...args) => console.log(chalk.red(...args))
}

function recursiveReadDir(dirName) {
    let files = []
    let filesTmp = fs.readdirSync(dirName)
    for (let filename of filesTmp) {
        let file = path.resolve(dirName, filename)
        let stat = fs.statSync(file)
        if (stat.isDirectory()) {
            files = [...files, ...recursiveReadDir(file)]
            continue
        }
        files.push(file)
    }
    return files
}

module.exports = {logger, recursiveReadDir}