const { express_logger_ignored_routes, logger_logs_dirname, logger_logs_filename, logger_errors_dirname, logger_errors_filename } = require('../config')

// Use this for "any start with" path e.g. /_next/*
const NEXT_IGNORED_ROUTES = ['/_next/on-demand-entries-ping']
const ignoreRoute = (req, res) => req.url.split('?')[0].includes(NEXT_IGNORED_ROUTES, 0)

// Use this for exactly path e.g. "/graphql"
const ignoredRoutes = (express_logger_ignored_routes && (express_logger_ignored_routes || '').split(',')) || []

// File transport
const winston = require('winston')
require('winston-daily-rotate-file')
const dirname = logger_logs_dirname || `logs`
const filename = `${logger_logs_filename || require('../../package.json').name.log}`
debug.info(`Logs    : ${dirname}/${filename}`)

// Transports
const transports = [
  new winston.transports.DailyRotateFile({
    dirname,
    filename,
    json: true,
    colorize: true,
    maxDays: 30
  })
]

// Winston's option
const options = {
  transports,
  ignoreRoute
}

const errorConfig = {
  dirname: logger_errors_dirname || `errors`,
  filename: `${logger_errors_filename || require('../../package.json').name.error}`
}
debug.info(`Errors  : ${errorConfig.dirname}/${errorConfig.filename}`)

const errorOptions = {
  transports: [
    new winston.transports.DailyRotateFile({
      dirname: errorConfig.dirname,
      filename: errorConfig.filename,
      json: true,
      colorize: true,
      maxDays: 30
    })
  ],
  ignoreRoute
}

module.exports = { ignoredRoutes, options, errorOptions }
