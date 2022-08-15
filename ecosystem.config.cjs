module.exports = {
  apps : [{
    name   : "discordBot",
    script : "./bot.js",
    watch : true,
    ignore_watch: "./persistence/discbot.db"
  }]
}
