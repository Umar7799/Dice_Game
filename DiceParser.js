export class DiceParser {
    static parseDice(args) {
        if (args.length < 3) {
            console.error("❌ Error: You must provide at least 3 dice.");
            console.log("Example: node game.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3");
            return null;
        }

        let dice = args.map(die => die.split(",").map(Number));

        for (let i = 0; i < dice.length; i++) {
            if (dice[i].length !== 6 || dice[i].some(isNaN)) {
                console.error(`❌ Error: Dice #${i + 1} is invalid. Must be 6 numbers.`);
                console.log("Example: node game.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3");
                return null;
            }
        }

        return dice;
    }
}
