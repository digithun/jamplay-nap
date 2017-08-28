const renderEmail = require('../email-signin')
const fs = require('fs')
const path = require('path')

describe('Email template test', () => {
  it('should render html string', () => {
    const htmlString = renderEmail(
      'foo.bar.com',
      'bar@foo.bar',
      'bar@foo.com/?id=bababababab'
    )
    fs.writeFileSync(path.join(__dirname, 'email-signup.tmp.html'), htmlString.html)
  })
})
