import { FairRandomGenerator } from "./FairRandomGenerator.js";
import chalk from "chalk";

export class DiceGame {
    constructor(dice, rl) {
        this.dice = dice;
        this.rl = rl;
        this.userDie = null;
        this.computerDie = null;
        this.scores = { user: 0, computer: 0 };
    }

    selectDice(callback) {
        console.log(chalk.magenta("\n🎲 Let's decide who picks the die first!"));
        const coinFlip = Math.floor(Math.random() * 2);

        if (coinFlip === 0) {
            console.log(chalk.green("🪙 Coin flip result: **User picks first!**"));

            this.dice.forEach((die, index) => console.log(`[${index + 1}] Die: ${chalk.cyan(die.join(", "))}`));

            this.rl.question(chalk.cyan("\nPick a die (1, 2, or 3): "), (choice) => {
                const index = parseInt(choice, 10) - 1;
                if (index >= 0 && index < this.dice.length) {
                    this.userDie = this.dice[index];
                    this.computerDie = this.dice.find(d => d !== this.userDie);
                } else {
                    console.log(chalk.red("❌ Invalid choice! Defaulting to first die."));
                    this.userDie = this.dice[0];
                    this.computerDie = this.dice.find(d => d !== this.userDie);
                }
                console.log(chalk.yellow("\n✅ Final Dice Selection:"));
                console.log(chalk.green("👤 User's Die:"), chalk.cyan(this.userDie));
                console.log(chalk.red("🤖 Computer's Die:"), chalk.cyan(this.computerDie));
                callback();
            });
        } else {
            console.log(chalk.red("🪙 Coin flip result: **Computer picks first!**"));

            const computerChoice = Math.floor(Math.random() * this.dice.length);
            this.computerDie = this.dice[computerChoice];
            this.userDie = this.dice.find(d => d !== this.computerDie);

            console.log(`🤖 Computer picked: ${chalk.red(this.computerDie.join(", "))}`);
            console.log(chalk.yellow("\n✅ Final Dice Selection:"));
            console.log(chalk.green("👤 User's Die:"), chalk.cyan(this.userDie));
            console.log(chalk.red("🤖 Computer's Die:"), chalk.cyan(this.computerDie));
            callback();
        }
    }

    playRound(roundNumber, callback) {
        console.log(chalk.blue(`\n🔹 Round ${roundNumber} Start!`));

        const secretKey = FairRandomGenerator.generateSecretKey();
        const computerValue = this.computerDie[Math.floor(Math.random() * 6)];
        const hmac = FairRandomGenerator.generateHMAC(secretKey, computerValue.toString());

        console.log(chalk.gray(`🔐 Computer's HMAC: ${hmac}`));

        this.rl.question(chalk.cyan("\nEnter your number (0-5): "), (input) => {
            const userIndex = parseInt(input, 10);
            if (isNaN(userIndex) || userIndex < 0 || userIndex >= this.userDie.length) {
                console.log(chalk.red("❌ Invalid choice! Try again."));
                return this.playRound(roundNumber, callback);
            }

            const userValue = this.userDie[userIndex];

            console.log(chalk.yellow("\n🔓 Revealing Values..."));
            console.log(`🤖 Computer's Value: ${chalk.red(computerValue)}`);
            console.log(`🔑 Secret Key: ${chalk.gray(secretKey)}`);

            const isValidHMAC = FairRandomGenerator.verifyHMAC(secretKey, computerValue.toString(), hmac);
            console.log(`✅ Verify HMAC: ${isValidHMAC ? chalk.green("Valid ✅") : chalk.red("Invalid ❌")}`);

            if (userValue > computerValue) {
                console.log(chalk.green("🎉 You win this round!"));
                this.scores.user++;
            } else if (userValue < computerValue) {
                console.log(chalk.red("💻 Computer wins this round!"));
                this.scores.computer++;
            } else {
                console.log(chalk.yellow("🤝 It's a tie!"));
            }

            callback();
        });
    }

    playGame(callback) {
        this.selectDice(() => {
            let round = 1;

            const nextRound = () => {
                if (round <= 3) {
                    this.playRound(round, () => {
                        round++;
                        nextRound();
                    });
                } else {
                    console.log(chalk.bgBlue("\n🏆 **Game Over!**"));
                    console.log(`👤 ${chalk.green("User: " + this.scores.user)} | 💻 ${chalk.red("Computer: " + this.scores.computer)}`);

                    if (this.scores.user > this.scores.computer) {
                        console.log(chalk.bgGreen("🎉 **You are the WINNER!**"));
                    } else if (this.scores.user < this.scores.computer) {
                        console.log(chalk.bgRed("💻 **Computer wins the game!**"));
                    } else {
                        console.log(chalk.bgYellow("🤝 **It's a tie!**"));
                    }

                    this.rl.close();
                    if (callback) callback();
                }
            };

            nextRound();
        });
    }
}
