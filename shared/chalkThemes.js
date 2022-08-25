import chalk from 'chalk';
import { Color } from '../models/enums.js';
//https://github.com/chalk/chalk
export const error = chalk.bold.red;
export const main = chalk.hex(Color.purple);
export const setup = chalk.hex(Color.cyan);
export const warning = chalk.hex(Color.orange);

export const database = (x) => { return chalk.hex(Color.yellow)("(database) " + x) };
export const internal = (context, message) => { return chalk.hex(Color.green)(`(${context.constructor.name}) ${message}`); };