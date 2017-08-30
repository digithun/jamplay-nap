const renderEmail = require('../email-forget')
const fs = require('fs')
const path = require('path')

describe('Email template test', () => {
  it('should render html string', () => {
    const htmlString = renderEmail(
      'foo@bar.com',
      'bar@foo.bar',
      'foo.bar.com',
      'bar@foo.com/?id=bababababab'
    )
    fs.writeFileSync(path.join(__dirname, 'email.tmp.html'), htmlString.html)
  })
})
