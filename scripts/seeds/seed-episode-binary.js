require('dotenv/config')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

mongoose.Promise = Promise

mongoose.connect(process.env.DATABASE_URI_FOR_SEED)

const { models } = require('./models')

const bookHTML = fs.readFileSync(path.resolve(__dirname, 'mock-book-with-scroll-ratio.html'))

models.Episode.update({ data: null, isSeed: true }, {
  data: {
    binary: bookHTML
  }
}, {
  multi: true
})
.then(() => console.log('complete'))
.catch(error => console.error(error.message))
.then(() => process.exit(0))
