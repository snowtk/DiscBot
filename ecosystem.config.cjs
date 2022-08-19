module.exports = {
  apps : [{
    name   : "discordBot",
    script : "./bot.js",
    watch : false,
    ignore_watch: "./persistence/discbot.db"
  }]
}
