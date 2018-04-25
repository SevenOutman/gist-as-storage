export default process.env.NODE_ENV === 'production' ? () => {} : console.log
export const warn = console.warn
