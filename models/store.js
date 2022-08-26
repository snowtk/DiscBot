//import * as db from '../persistence/dbManager.js'

export class RoleStore {

    log(message, ...params) {
        logger.log(chalkThemes.internal(this, message), ...params);
    }

    constructor(
        id,
        guildId,
        roleId,
        isDynamic,
        cost
    ) {
        this.id = id;
        this.guildId = guildId;
        this.roleId = roleId;
        this.isDynamic = isDynamic;
        this.cost = cost;
    }
/*
    static async addRole(guildId, roleId, isDynamic, cost) {
        if (await RoleStore.findRoleInStore(roleId, guildId)) return null;

        const role = {
            guildId, roleId, isDynamic, cost
        }

        return await db.addRoleToStore(role);
    }

    async getAllRoles() {
        return await db.getAllRolesFromStore(this.guildId);
    }

    static async findRoleInStore(roleId, guildId) {
        return await db.getRoleInStore(roleId, guildId);
    }
    */
}