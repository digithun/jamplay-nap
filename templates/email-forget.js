// User will receive this email to reset password
// @see https://github.com/mailgun/mailgun-js#messages

const contentStyle = `
  background-color: #f9fafb;
  padding: 40px 40px;
  border: 1px solid #ebebeb;
  text-align: center;
`
const footerContainerStyle = `
  margin-top: 20px;
  margin-bottom: 20px;
  text-align: center;
  color: #666;
`
const footerItemWrap = `
  display: inline-block;
`
const footerItemBorder = `
  border-right: 1px solid #ebebeb;
  padding-right: 10px;
  margin-right: 10px;
`
const contactStyle = `
  font-size: 22px;
  color: #333;
`
module.exports = (domain, email, password_reset_url, new_password_reset_url) => ({
  from: 'noreply@' + domain,
  to: [email],
  subject: `[${domain}] Please reset your password`,
  text: `
  
  <img src='http://static.jamplay.world:3002/static/logo-orange@2x.png' style='width:150px;margin-bottom:10px' /> 
  <div style='font-size:26px;font-weight:bold;color:white;background-color:#df6336;padding: 20px;text-align:center;'>เปลี่ยนรหัสผ่านใหม่</div> 
  <div style='${contentStyle}'>
    <p>
      กดลิ้งค์ด้านล่าง เพื่อดำเนินการเปลี่ยนรหัสผ่านใหม่
    </p>
    <p>
      <a href='${password_reset_url}'>${password_reset_url}</a>
    </p>
  
  </div>
  <div style='${footerContainerStyle}'>
    <a style='${footerItemWrap}${footerItemBorder}' href='http://www.jamplay.world/about'>เกี่ยวกับ JamPlay</a>
    <a style='${footerItemWrap}${footerItemBorder}' href='http://www.jamplay.world/privacy'>นโยบาลความเป็นส่วนตัว</a>
    <a style='${footerItemWrap}' href='http://www.jamplay.world/agreement'>ข้อตกลงการใช้บริการ</a>
  </div>

  <div style='${footerContainerStyle}'>
    ติดต่อเรา <span style='${contactStyle}'> โทร. 02-2580486 ต่อ 115 </span> หรือ <span style='${contactStyle}'> อีเมล. artery@keystream.co </span>
  </div>
  `
})
