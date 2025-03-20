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
        console.log("\nLet's determine who makes the first move.");

        const secretKey = FairRandomGenerator.generateSecretKey();
        const coinFlip = Math.floor(Math.random() * 2);
        const hmac = FairRandomGenerator.generateHMAC(secretKey, coinFlip.toString());

        console.log(`I selected a random value in the range 0..1 (HMAC=${hmac}).`);
        this.rl.question("Try to guess my selection.\n0 - 0\n1 - 1\nX - exit\n? - help\nYour selection: ", (input) => {
            if (input.toLowerCase() === 'x') return this.exitGame();

            const userPrediction = parseInt(input, 10);
            if (isNaN(userPrediction) || (userPrediction !== 0 && userPrediction !== 1)) {
                console.log("Invalid input. Please enter 0, 1, or 'x' to exit.");
                return this.selectDice(callback);
            }

            console.log(`My selection: ${coinFlip} (KEY=${secretKey}).`);
            if (userPrediction === coinFlip) {
                console.log("You make the first move and choose the dice.");
                this.askUserForDie(callback);
            } else {
                console.log("I make the first move and choose the dice.");
                this.computerSelectsDie(callback);
            }
        });
    }

    askUserForDie(callback) {
        this.dice.forEach((die, index) => console.log(`${index} - ${die.join(", ")}`));

        this.rl.question("Your selection: ", (choice) => {
            if (choice.toLowerCase() === 'x') return this.exitGame();

            const index = parseInt(choice, 10);
            if (index >= 0 && index < this.dice.length) {
                this.userDie = this.dice[index];
                this.computerDie = this.dice.find((_, i) => i !== index);
            } else {
                console.log("Invalid choice! Defaulting to first die.");
                this.userDie = this.dice[0];
                this.computerDie = this.dice[1];
            }

            console.log(`You choose the [${this.userDie.join(", ")}] dice.`);
            console.log("It's time for my roll.");

            callback();
        });
    }

    computerSelectsDie(callback) {
        const computerChoice = Math.floor(Math.random() * this.dice.length);
        this.computerDie = this.dice[computerChoice];

        console.log(`I make the first move and choose the [${this.computerDie.join(", ")}] dice.`);

        // Ensure user picks from the remaining dice
        const remainingDice = this.dice.filter((_, i) => i !== computerChoice);
        this.askUserForRemainingDie(remainingDice, callback);
    }

    askUserForRemainingDie(remainingDice, callback) {
        remainingDice.forEach((die, index) => console.log(`${index} - ${die.join(", ")}`));

        this.rl.question("Your selection: ", (choice) => {
            if (choice.toLowerCase() === 'x') return this.exitGame();

            const index = parseInt(choice, 10);
            this.userDie = index >= 0 && index < remainingDice.length ? remainingDice[index] : remainingDice[0];

            console.log(`You choose the [${this.userDie.join(", ")}] dice.`);
            console.log("It's time for my roll.");

            callback();
        });
    }

    playRound(roundNumber, callback) {
        console.log(`\n--- Round ${roundNumber} ---`);
        console.log("It's time for my roll.");

        // Computer's Roll
        const secretKeyComputer = FairRandomGenerator.generateSecretKey();
        const computerRand = Math.floor(Math.random() * 6);
        const hmacComputer = FairRandomGenerator.generateHMAC(secretKeyComputer, computerRand.toString());

        console.log(`I selected a random value in the range 0..5 (HMAC=${hmacComputer}).`);
        this.rl.question("Add your number modulo 6.\n0 - 0\n1 - 1\n2 - 2\n3 - 3\n4 - 4\n5 - 5\nX - exit\n? - help\nYour selection: ", (input) => {
            if (input.toLowerCase() === 'x') return this.exitGame();

            const userRand = parseInt(input, 10);
            if (isNaN(userRand) || userRand < 0 || userRand > 5) {
                console.log("Invalid choice! Try again.");
                return this.playRound(roundNumber, callback);
            }

            const computerRollIndex = (computerRand + userRand) % 6;
            const computerRollValue = this.computerDie[computerRollIndex];

            console.log(`My number is ${computerRand} (KEY=${secretKeyComputer}).`);
            console.log(`The fair number generation result is ${computerRand} + ${userRand} = ${computerRollIndex} (mod 6).`);
            console.log(`My roll result is ${computerRollValue}.`);

            console.log("It's time for your roll.");

            // User's Roll
            const secretKeyUser = FairRandomGenerator.generateSecretKey();
            const hmacUser = FairRandomGenerator.generateHMAC(secretKeyUser, "0"); // User does not know index yet

            console.log(`I selected a random value in the range 0..5 (HMAC=${hmacUser}).`);
            this.rl.question("Add your number modulo 6: ", (input) => {
                if (input.toLowerCase() === 'x') return this.exitGame();

                const userRand2 = parseInt(input, 10);
                if (isNaN(userRand2) || userRand2 < 0 || userRand2 > 5) {
                    console.log("Invalid choice! Try again.");
                    return this.playRound(roundNumber, callback);
                }

                const userRollIndex = (0 + userRand2) % 6;
                const userRollValue = this.userDie[userRollIndex];

                console.log(`My number is 0 (KEY=${secretKeyUser}).`);
                console.log(`The fair number generation result is 0 + ${userRand2} = ${userRollIndex} (mod 6).`);
                console.log(`Your roll result is ${userRollValue}.`);

                if (userRollValue > computerRollValue) {
                    console.log("You win this round!");
                    this.scores.user++;
                } else {
                    console.log("I win this round!");
                    this.scores.computer++;
                }

                callback();
            });
        });
    }

    playGame() {
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
                    console.log(`Final Score -> User: ${this.scores.user} | Computer: ${this.scores.computer}`);

                    if (this.scores.user > this.scores.computer) {
                        console.log("You are the winner!");
                    } else {
                        console.log("I win!");
                    }

                    this.rl.close();
                }
            };

            nextRound();
        });
    }
}
