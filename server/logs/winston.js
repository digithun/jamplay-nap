const { express_logger_ignored_routes, logger_logs_dirname, logger_access_filename, logger_error_filename } = require('../config')

// Use this for "any start with" path e.g. /_next/*
const NEXT_IGNORED_ROUTES = ['/_next/on-demand-entries-ping']
const ignoreRoute = (req, res) => req.url.split('?')[0].includes(NEXT_IGNORED_ROUTES, 0)

// Use this for exactly path e.g. "/graphql"
const ignoredRoutes = (express_logger_ignored_routes && (express_logger_ignored_routes || '').split(',')) || []

// ---- Dir ----

const winston = require('winston')
require('winston-daily-rotate-file')
const dirname = logger_logs_dirname || `logs`

// ---- Access ----

const access_filename = logger_access_filename || `${require('../../package.json').name}.access`
debug.info(`Access  : Path = ${dirname}/${access_filename}`)

// Winston's option
const accessOptions = {
  transports: [
    new winston.transports.DailyRotateFile({
      dirname,
      filename: access_filename,
      json: true,
      colorize: true,
      maxDays: 30
    })
  ],
  ignoreRoute
}

// ---- Error ----

const error_filename = logger_error_filename || `${require('../../package.json').name}.error`
debug.info(`Error   : Path = ${dirname}/${error_filename}`)

const errorOptions = {
  transports: [
    new winston.transports.DailyRotateFile({
      dirname,
      filename: error_filename,
      json: true,
      colorize: true,
      maxDays: 30
    })
  ],
  ignoreRoute
}

module.exports = { ignoredRoutes, accessOptions, errorOptions }
