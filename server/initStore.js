const init = mongoose => {
  // Guard
  if (!mongoose) {
    debug.warn(`MongoDB : Mongoose is undefined`)
    return
  }

  // Global
  try {
    NAP.Installation = NAP.Installation || mongoose.model('Installation')
    NAP.User = NAP.User || mongoose.model('User')
    NAP.Authen = NAP.Authen || mongoose.model('Authen')
    NAP.Provider = NAP.Provider || mongoose.model('Provider')
  } catch (err) {
    debug.warn('Mongoose error :', err)
  }
}

module.exports = init
