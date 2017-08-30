// User will receive this email to reset password
// @see https://github.com/mailgun/mailgun-js#messages

const headerBgColor = '#f15a23'
const bodyBgColor = '#f1f1f1'
const bodyBorderColor = '#e7e7e7'
const confirmTxtColor = '#f15a23'

const table = `
  border-spacing: 0;
`

const headerTableContainer = `
  background: ${headerBgColor};
`

const headerTableBorder = `
  border-left: 1px solid ${headerBgColor};
  border-right: 1px solid ${headerBgColor};
  border-top: 1px solid ${headerBgColor};
`

const headerLogoContainer = `
  width: 100%;
  padding: 25px 0;
  text-align: center;
`

const logoImg = `
  background: ${headerBgColor};
  height: 50px;
`

const bodyTableContainer = `
  background: ${bodyBgColor};
`

const bodyTableContent = `
  text-align: center;
  padding: 40px;
  border-left: 1px solid ${bodyBorderColor};
  border-right: 1px solid ${bodyBorderColor};
  border-top: 1px solid ${bodyBorderColor};
`

const sectionConfirmEmail = `
  color: ${confirmTxtColor};
  font-weight: 600;
  font-size: xx-large;
`

const sectionDetail = `
  margin-top: 10px;
  font-size: larger;
`

const sectionVerificationUrl = `
  margin-top: 25px;
`

const footerRow1 = `
  text-align: center;
  margin-top: 25px;
`

const footerRow234 = `
  text-align: center;
  margin-top: 7px;
`

const footerLink = `
  text-decoration: none;
  color: #999999;
`

const footerLinkSeparation = `
  color: #999999;
  padding: 0 10px;
`

const socialMediaLink = `
  padding: 0 10px;
  text-decoration: none;
`

const socialMediaIconContainer = `
  overflow: hidden;
  border-radius: 20px;
  border: none;
  display: inline-block;
`

const socialMediaIcon = `
  width: 40px;
  height: 40px;
  z-index: -1;
  position: relative;
  vertical-align: bottom;
`

const copyrights = `
  color: #999999;
`

module.exports = (domain, email, password_reset_url, new_password_reset_url) => ({
  from: `JamPlay.World <noreply@${domain}>`,
  to: [email],
  subject: `ยืนยันการสมัครสมาชิก`,
  html: `
  <table width="100%" style='${table}'>
    <tr style='${headerTableContainer}'>
      <td style='${headerTableBorder}'>
        <div style='${headerLogoContainer}'>
          <a href="http://alpha.jamplay.world">
            <img style='${logoImg}' src="http://alpha.jamplay.world/static/images/logo@2x.png">
          </a>
        </div>
      </td>
    </tr>
    <tr style='${bodyTableContainer}'>
      <td style='${bodyTableContent}'>
        <div>
          <section style='${sectionConfirmEmail}'>เปลี่ยนรหัสผ่านใหม่</section>
        </div>
        <div>
          <section style='${sectionDetail}'>กดลิงค์ด้านล่าง เพื่อดำเนินการเปลี่ยนรหัสผ่านใหม่</section>
        </div>
        <div>
          <section style='${sectionVerificationUrl}'>
            <a href='${password_reset_url}'>${password_reset_url}</a>
          </section>
        </div>
      </td>
    </tr>
  </table>
  <table width="100%" style='${table}'>
    <tr>
      <td>
        <div style='${footerRow1}'>
          <a style='${footerLink}' href="http://alpha.jamplay.world/about">เกี่ยวกับ JamPlay</a>
          <span style='${footerLinkSeparation}'>|</span>
          <a style='${footerLink}' href="http://alpha.jamplay.world/about">นโยบายความเป็นส่วนตัว</a>
          <span style='${footerLinkSeparation}'>|</span>
          <a style='${footerLink}' href="http://alpha.jamplay.world/about">ข้อตกลงในการใช้บริการ</a>
        </div>
        <div style='${footerRow234}'>
          <label>ติดต่อเรา: </label>
          <a href="http://alpha.jamplay.world/about">info@jamplay.world</a>
        </div>
        <div style='${footerRow234}'>
          <a style='${socialMediaLink}' href="https://www.facebook.com/jamsaibookfan">
            <div style='${socialMediaIconContainer}'>
              <img style='${socialMediaIcon}' src="https://cdnjs.cloudflare.com/ajax/libs/webicons/2.0.0/webicons/webicon-facebook.png">
            </div>
          </a>
          <a style='${socialMediaLink}' href="https://twitter.com/jamsai">
            <div style='${socialMediaIconContainer}'>
              <img style='${socialMediaIcon}' src="https://cdnjs.cloudflare.com/ajax/libs/webicons/2.0.0/webicons/webicon-twitter.png">
            </div>
          </a>
        </div>
        <div style='${footerRow234}'>
          <section style='${copyrights}'>Copyright © 2017 JamPlay All rights reserved.</section>
        </div>
      </td>
    </tr>
  </table>
`
})
