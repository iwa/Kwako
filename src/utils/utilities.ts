export default class utilities {

    static randomInt(max: number): number {
        return Math.floor(Math.random() * Math.floor(max) + 1);
    }

    static levelInfo(xp: number): { 'level': number, 'current': number, 'max': number } {
        let x = 100;
        for (let i = 1; i < 50; i++) {
            if (xp < x) {
                return { 'level': i, 'current': xp, 'max': x }
            }
            xp -= x;
            x = Math.round(Math.log(Math.pow(x, 2))+(x*1.12))
        }
        return { 'level': 50, 'current': 1, 'max': 1 }
    }

    static expForLevel(level: number): number {
        let x = 100;
        let xp = 0;
        for (let i = 1; i <= level; i++) {
            xp += x;
            x = Math.round(Math.log(Math.pow(x, 2))+(x*1.12))
        }
        return xp;
    }
}