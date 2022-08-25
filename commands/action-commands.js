import { CommandName } from "../models/enums.js";
import * as guildAction from "./guild-commands.js";
import * as userAction from "./user-commands.js";
import * as adminAction from "./admin-commands.js";

export const actions = new Map([
    //user domain
    [CommandName.beg, userAction.begAction],
    [CommandName.giveCoin, userAction.giveCoins],
    [CommandName.topRich, userAction.topRichAction],
    [CommandName.getUserProfile, userAction.getUserProfile],
    //guild domain
    [CommandName.addCashToGuild, guildAction.addCashToGuild],
    [CommandName.guildTopRich, guildAction.guildsTopRich],
    [CommandName.getGuildProfile, guildAction.getGuildProfile],
    //admin domain
    [CommandName.setCoin, adminAction.setCoinAction],
    [CommandName.addRoleToShop, adminAction.addRoleToShop]
])
