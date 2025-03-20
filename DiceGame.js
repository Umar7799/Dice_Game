import { FairRandomGenerator } from "./FairRandomGenerator.js";

export class DiceGame {
    constructor(dice, rl) {
        this.dice = dice;
        this.rl = rl;
        this.userDie = null;
        this.computerDie = null;
        this.scores = { user: 0, computer: 0 };
    }

    exitGame() {
        console.log("Exiting game... See you next time!");
        this.rl.close();
        process.exit(0);
    }

    selectDice(callback) {
        console.log("\nCoin flip to decide who picks the die first.");

        const secretKey = FairRandomGenerator.generateSecretKey();
        const coinFlip = Math.floor(Math.random() * 2);
        const hmac = FairRandomGenerator.generateHMAC(secretKey, coinFlip.toString());

        console.log(`HMAC of Coin Flip: ${hmac}`);
        this.rl.question("Predict coin flip result (0 or 1, or type 'x' to exit): ", (input) => {
            if (input.toLowerCase() === 'x') return this.exitGame();

            const userPrediction = parseInt(input, 10);
            if (isNaN(userPrediction) || (userPrediction !== 0 && userPrediction !== 1)) {
                console.log("Invalid input. Please enter 0, 1, or 'x' to exit.");
                return this.selectDice(callback);
            }

            console.log(`Secret Key: ${secretKey}`);
            console.log(`Coin flip result: ${coinFlip}`);
            console.log(`HMAC Verification: ${FairRandomGenerator.verifyHMAC(secretKey, coinFlip.toString(), hmac) ? "Valid" : "Invalid"}`);

            if (userPrediction === coinFlip) {
                console.log("You guessed right! You pick first.");
                this.askUserForDie(callback);
            } else {
                console.log("Computer picks first.");
                this.computerSelectsDie(callback);
            }
        });
    }

    askUserForDie(callback) {
        this.dice.forEach((die, index) => console.log(`[${index + 1}] Die: ${die.join(", ")}`));

        this.rl.question("Pick a die (1, 2, or more, or type 'x' to exit): ", (choice) => {
            if (choice.toLowerCase() === 'x') return this.exitGame();

            const index = parseInt(choice, 10) - 1;
            if (index >= 0 && index < this.dice.length) {
                this.userDie = this.dice[index];

                // Remove the chosen die and let the computer pick from the remaining ones
                const remainingDice = this.dice.filter((_, i) => i !== index);
                this.computerDie = remainingDice[Math.floor(Math.random() * remainingDice.length)];

                console.log(`You picked: ${this.userDie.join(", ")}`);
                console.log(`Computer picked: ${this.computerDie.join(", ")}`);
            } else {
                console.log("Invalid choice! Defaulting to first die.");
                this.userDie = this.dice[0];

                const remainingDice = this.dice.slice(1);
                this.computerDie = remainingDice[Math.floor(Math.random() * remainingDice.length)];

                console.log(`You got: ${this.userDie.join(", ")}`);
                console.log(`Computer picked: ${this.computerDie.join(", ")}`);
            }

            console.log("Dice selection completed. Starting game...");
            callback();
        });
    }

    computerSelectsDie(callback) {
        const computerChoice = Math.floor(Math.random() * this.dice.length);
        this.computerDie = this.dice[computerChoice];

        console.log(`Computer picked: ${this.computerDie.join(", ")}`);

        // Ensure user picks from the remaining dice
        const remainingDice = this.dice.filter((_, i) => i !== computerChoice);
        this.askUserForRemainingDie(remainingDice, callback);
    }

    askUserForRemainingDie(remainingDice, callback) {
        console.log("Pick a die from the remaining ones:");
        remainingDice.forEach((die, index) => console.log(`[${index + 1}] Die: ${die.join(", ")}`));

        this.rl.question("Pick your die (1 or more, or type 'x' to exit): ", (choice) => {
            if (choice.toLowerCase() === 'x') return this.exitGame();

            const index = parseInt(choice, 10) - 1;
            if (index >= 0 && index < remainingDice.length) {
                this.userDie = remainingDice[index];
                console.log(`You picked: ${this.userDie.join(", ")}`);
            } else {
                console.log("Invalid choice! Defaulting to first remaining die.");
                this.userDie = remainingDice[0];
                console.log(`You got: ${this.userDie.join(", ")}`);
            }

            console.log("Dice selection completed. Starting game...");
            callback();
        });
    }

    playRound(roundNumber, callback) {
        console.log(`\nRound ${roundNumber}`);

        // Computer's roll
        const secretKeyComputer = FairRandomGenerator.generateSecretKey();
        const computerIndex = Math.floor(Math.random() * 6);
        const computerValue = this.computerDie[computerIndex];
        const hmacComputer = FairRandomGenerator.generateHMAC(secretKeyComputer, computerValue.toString());

        console.log(`HMAC (Computer's Roll): ${hmacComputer}`);

        this.rl.question("Enter your number index (0-5, or type 'x' to exit): ", (input) => {
            if (input.toLowerCase() === 'x') return this.exitGame();

            const userIndex = parseInt(input, 10);
            if (isNaN(userIndex) || userIndex < 0 || userIndex >= this.userDie.length) {
                console.log("Invalid choice! Try again.");
                return this.playRound(roundNumber, callback);
            }

            // User's roll
            const secretKeyUser = FairRandomGenerator.generateSecretKey();
            const userValue = this.userDie[userIndex];
            const hmacUser = FairRandomGenerator.generateHMAC(secretKeyUser, userValue.toString());

            console.log(`HMAC (User's Roll): ${hmacUser}`);

            console.log("\nRevealing values...");
            console.log(`Computer's Value: ${computerValue} (Secret Key: ${secretKeyComputer})`);
            console.log(`HMAC Verification: ${FairRandomGenerator.verifyHMAC(secretKeyComputer, computerValue.toString(), hmacComputer) ? "Valid" : "Invalid"}`);

            console.log(`Your Value: ${userValue} (Secret Key: ${secretKeyUser})`);
            console.log(`HMAC Verification: ${FairRandomGenerator.verifyHMAC(secretKeyUser, userValue.toString(), hmacUser) ? "Valid" : "Invalid"}`);

            if (userValue > computerValue) {
                console.log("You win this round.");
                this.scores.user++;
            } else if (userValue < computerValue) {
                console.log("Computer wins this round.");
                this.scores.computer++;
            } else {
                console.log("It's a tie.");
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
                    console.log("\nGame Over.");
                    console.log(`User: ${this.scores.user} | Computer: ${this.scores.computer}`);

                    if (this.scores.user > this.scores.computer) {
                        console.log("You are the winner!");
                    } else if (this.scores.user < this.scores.computer) {
                        console.log("Computer wins the game.");
                    } else {
                        console.log("It's a tie.");
                    }

                    this.rl.close();
                    if (callback) callback();
                }
            };

            nextRound();
        });
    }
}
