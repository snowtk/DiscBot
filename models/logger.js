export function log(message, ...params){
    let date = new Date();
    console.log(date.toLocaleTimeString('en-GB') + ": " + message, ...params);
  }