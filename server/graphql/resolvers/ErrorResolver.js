module.exports.resolver = ({ context }) => async () => (context.nap.errors.length > 0 ? context.nap.errors : null)
