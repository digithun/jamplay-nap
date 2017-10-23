// Use this for "any start with" path e.g. /_next/*
const NEXT_IGNORED_ROUTES = ['/_next/on-demand-entries-ping']
const ignoreRoute = (req, res) => req.url.split('?')[0].includes(NEXT_IGNORED_ROUTES, 0)

// Use this for exactly path e.g. "/graphql"
const ignoredRoutes = (process.env.express_logger_ignored_routes && (process.env.express_logger_ignored_routes || '').split(',')) || []

// Winston's option
const options = { ignoreRoute }
module.exports = { ignoredRoutes, options }
