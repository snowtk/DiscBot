import { Repository } from "../persistence/repository.js";

const defaultCoinName = 'coins'
var repo = new Repository();

export class DiscordGuild {
    constructor(id, name, coinEmote = 'coins', guild = null, bank = 0) {
        this.id = id;
        this.name = name;
        this.coinEmote = coinEmote || defaultCoinName;
        this.guild = guild;
        this.bank = bank;
    }

    addCashToGuildBank(user, amount) {
        if (user && amount > 0) {
            user.removeCash(amount);
            repo.updateGuildBank(this, amount);
            this.bank += amount;
            return true;
        }
        return false;
    }

    setCoin(coinEmote) {
        this.coinEmote = coinEmote;
        repo.updateGuildCoin(this, coinEmote);
    }

    getGuildProfileInformation() {
        const guildAttrs = new Map([
            ['Bank', `${this.bank} ${this.coinEmote}`]
        ]);

        const content = [];
        guildAttrs.forEach((value, key) => {
            content.push(`${key} : ${value}`);
        });

        return content.join('\n');

    }

    async getTopRichestUsers(){
        return await repo.getTopRichestUsers(this.id);
    }

    static async getGuild(guildId){
        return await repo.getGuild(guildId);
    }

    static async getRichestGuilds(){
        return await repo.getRichestGuilds();
    }
}