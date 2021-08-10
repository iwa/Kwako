import { PermissionString } from "discord.js";
import PermLevels from "./PermLevels";

export default class Command {

    public readonly name: string;
    public readonly desc: string;
    public readonly runMsg: Function;
    public readonly runInteraction: Function;

    public readonly permLevel: PermLevels;
    public readonly aliases: readonly string[];
    public readonly discordPerm: PermissionString[];
    public readonly usage: string;
    public readonly premium: boolean;

    constructor(name: string, desc: string, runMsg: Function, runInteraction: Function, permLevel: PermLevels, aliases: string[], discordPerm: PermissionString[], usage: string) {
        this.name = name;
        this.desc = desc;
        this.runMsg = runMsg;
        this.runInteraction = runInteraction;
        this.permLevel = permLevel;
        this.aliases = aliases || [];
        this.discordPerm = discordPerm || [];
        this.usage = usage || "?";
    }
}