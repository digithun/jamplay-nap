// Use this for "any start with" path e.g. /_next/*
const NEXT_IGNORED_ROUTES = ['/_next/on-demand-entries-ping']
const ignoreRoute = (req, res) => req.url.split('?')[0].includes(NEXT_IGNORED_ROUTES, 0)

// Use this for exactly path e.g. "/graphql"
const ignoredRoutes = (process.env.express_logger_ignored_routes && (process.env.express_logger_ignored_routes || '').split(',')) || []

// File transport
const winston = require('winston')
require('winston-daily-rotate-file')
const dirname = process.env.express_logger_dirname || `logs`
const filename = `${process.env.express_logger_filename || require('../../package.json').name}.log`

// UI
const { base_url, log_port } = require('../config')
const { URL } = require('url')
const { port, origin } = new URL(base_url)
require('winston-node-monitor-ui')

debug.info(`Logs    : ${dirname}/${filename}`)

// Winston's option
const options = {
  transports: [
    new winston.transports.NodeMonitorUI({
      port: log_port,
      level: 'info'
    }),
    new winston.transports.DailyRotateFile({
      dirname,
      filename,
      json: true,
      colorize: true,
      maxDays: 30
    })
  ],
  ignoreRoute
}

const errorConfig = {
  dirname: process.env.express_logger_dirname || `errors`,
  filename: `${process.env.express_logger_filename || require('../../package.json').name}.error`
}

debug.info(`Logs    : ${dirname}/${filename}`)
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

// UI
const metrics = require('node-monitor-ui')
metrics.init(log_port)
debug.info(`Logs UI : ${origin.split(`:${port}`)[0]}:${log_port}`)

module.exports = { ignoredRoutes, options, errorOptions }
