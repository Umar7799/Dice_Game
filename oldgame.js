#!/usr/bin/env node

const process = require("process");
const crypto = require("crypto");
const readlineSync = require("readline-sync");
const chalk = require("chalk");
const Table = require("cli-table3");

function parseDice(args) {
    if (args.length < 3) {
        console.error(chalk.red("❌ Error: You must provide at least 3 dice."));
        console.log(chalk.yellow("Example: node game.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3"));
        return null;
    }

    let dice = args.map(die => die.split(",").map(Number));

    for (let i = 0; i < dice.length; i++) {
        if (dice[i].length !== 6 || dice[i].some(isNaN)) {
            console.error(chalk.red(`❌ Error: Dice #${i + 1} is invalid. Must be 6 numbers.`));
            console.log(chalk.yellow("Example: node game.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3"));
            return null;
        }
    }

    return dice;
}

function selectDiceFairly(dice) {
    console.log(chalk.cyan("\n🎲 Let's decide who picks the die first!"));

    const coinFlip = Math.floor(Math.random() * 2); 

    if (coinFlip === 0) {
        console.log(chalk.green("🪙 Coin flip result: **User picks first!**"));

        for (let i = 0; i < dice.length; i++) {
            console.log(chalk.yellow(`[${i + 1}] Die: ${dice[i].join(", ")}`));
        }

        const choice = readlineSync.questionInt("\nPick a die (1, 2, or 3): ") - 1;
        if (choice < 0 || choice >= dice.length) {
            console.log(chalk.red("❌ Invalid choice! Defaulting to first die."));
        }

        const userDie = dice[choice] || dice[0];
        const remainingDice = dice.filter(d => d !== userDie);
        const computerDie = remainingDice[Math.floor(Math.random() * remainingDice.length)];

        return { userDie, computerDie };

    } else {
        console.log(chalk.red("🪙 Coin flip result: **Computer picks first!**"));

        const computerChoice = Math.floor(Math.random() * dice.length);
        const computerDie = dice[computerChoice];
        const remainingDice = dice.filter(d => d !== computerDie);
        const userDie = remainingDice[Math.floor(Math.random() * remainingDice.length)];

        console.log(chalk.magenta(`🤖 Computer picked: ${computerDie.join(", ")}`));
        return { userDie, computerDie };
    }
}

function rollDie(die) {
    const rollIndex = Math.floor(Math.random() * die.length);
    return die[rollIndex];
}

function generateHMAC(secretKey, message) {
    return crypto.createHmac("sha256", secretKey).update(message).digest("hex");
}

function playRound(userDie, computerDie, scores) {
    const secretKey = crypto.randomBytes(32).toString("hex");
    const computerRoll = rollDie(computerDie);
    const hmac = generateHMAC(secretKey, computerRoll.toString());

    console.log(chalk.cyan("\n🎲 Rolling dice..."));
    console.log(chalk.yellow(`🤖 Computer's HMAC: ${hmac}`));

    readlineSync.question("\nPress Enter to roll your die...");
    const userRoll = rollDie(userDie);

    console.log(chalk.green(`👤 You rolled: ${userRoll}`));
    console.log(chalk.magenta(`🤖 Computer rolled: ${computerRoll}`));
    console.log(chalk.blue(`🔑 Secret Key: ${secretKey}`));
    console.log(chalk.yellow(`✅ Verify HMAC: ${generateHMAC(secretKey, computerRoll.toString()) === hmac ? "Valid ✅" : "Invalid ❌"}`));

    if (userRoll > computerRoll) {
        console.log(chalk.green("🎉 You win this round!"));
        scores.user++;
    } else if (userRoll < computerRoll) {
        console.log(chalk.red("💻 Computer wins this round!"));
        scores.computer++;
    } else {
        console.log(chalk.cyan("🤝 It's a tie!"));
    }

    // Display results in a table
    let table = new Table({
        head: [chalk.blue("Round"), chalk.green("User Roll"), chalk.magenta("Computer Roll"), chalk.yellow("Result")],
        colWidths: [10, 15, 20, 15],
    });

    let result = userRoll > computerRoll ? chalk.green("Win 🎉") : userRoll < computerRoll ? chalk.red("Lose 💻") : chalk.cyan("Tie 🤝");

    table.push([scores.user + scores.computer, userRoll, computerRoll, result]);
    console.log(table.toString());
}

// Main execution
const args = process.argv.slice(2);
const dice = parseDice(args);

if (!dice) {
    process.exit(1);
}

const { userDie, computerDie } = selectDiceFairly(dice);

console.log(chalk.yellow("\n✅ Final Dice Selection:"));
console.log(chalk.green("👤 User's Die:"), userDie);
console.log(chalk.magenta("🤖 Computer's Die:"), computerDie);

// Track scores
let scores = { user: 0, computer: 0 };

for (let i = 1; i <= 3; i++) {
    console.log(chalk.blue(`\n🔹 Round ${i}`));
    playRound(userDie, computerDie, scores);
}

// Display final winner
console.log(chalk.yellow("\n🏆 **Game Over!**"));
console.log(chalk.green(`👤 User: ${scores.user}`) + " | " + chalk.red(`💻 Computer: ${scores.computer}`));

if (scores.user > scores.computer) {
    console.log(chalk.green("🎉 **You are the WINNER!**"));
} else if (scores.user < scores.computer) {
    console.log(chalk.red("💻 **Computer wins the game!**"));
} else {
    console.log(chalk.cyan("🤝 **It's a tie!**"));
}
