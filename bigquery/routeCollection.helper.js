
const { bigquery_route_map } = require('../server/config')
const convertRouteNameToCollection = (rows) => {

      const converter = (row) => {
            if (bigquery_route_map.hasOwnProperty(row.contentType)) row.contentType = bigquery_route_map[row.contentType]
      }

      if (typeof rows === Array) {
            for (var i = 0; i < rows.length; i++) {
                  converter(rows[i]);
            }
      } else {
            converter(rows);
      }
      return rows
}
module.exports = { convertRouteNameToCollection }