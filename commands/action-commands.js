import { CommandName } from "../models/enums.js";
import * as guildAction from "./guild-commands.js";
import * as userAction from "./user-commands.js";

export const actions = new Map([
    [CommandName.beg, userAction.begAction],
    [CommandName.giveCoin, userAction.giveCoins],
    [CommandName.setCoin, userAction.setCoinAction],
    [CommandName.topRich, userAction.topRichAction],
    [CommandName.getUserProfile, userAction.getUserProfile],
    [CommandName.addCashToGuild, guildAction.addCashToGuild],
    [CommandName.guildTopRich, guildAction.guildsTopRich],
    [CommandName.getGuildProfile, guildAction.getGuildProfile]
]
)
