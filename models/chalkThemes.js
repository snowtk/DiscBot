import chalk from 'chalk';
//https://github.com/chalk/chalk
export const setup = chalk.cyan;
export const error = chalk.bold.red;
export const database = (x) => {return chalk.hex('#f5d81d')("(database) " + x)};
export const main = chalk.hex('#9326ff');
export const internal = (context, message) => {return chalk.hex('#009480')(`(${context.constructor.name}) ${message}`);};
export const warning = chalk.hex('#FFA500'); //#009480