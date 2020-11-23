export default interface GuildConfig {
    prefix: string,
    welcomeMessage: string,
    starboardChannel: string,
    muteRole: string,
    modLogChannel: string,
    suggestionChannel: string,
    disabledCommands: string[],
    useExpSystem: boolean,
    showLevelUp: boolean,
    boosterBenefits: boolean,
    customEmote: string,
    starReactions: number
}