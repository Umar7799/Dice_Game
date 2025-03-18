import chalk from "chalk";
import Table from "cli-table3";

export class ProbabilityTable {
    static display(probabilities) {
        const numDice = probabilities.length;

        const table = new Table({
            head: [chalk.bold.blue("🎲 Dice"), ...probabilities.map((_, i) => chalk.bold(`Die ${i + 1}`))],
            colWidths: [12, ...Array(numDice).fill(10)],
            style: { head: [], border: [] }
        });

        for (let i = 0; i < numDice; i++) {
            table.push([
                chalk.bold(`Die ${i + 1}`),
                ...probabilities[i].map(p => (p === "—" ? chalk.gray(p) : chalk.green(p)))
            ]);
        }

        console.log(chalk.bold("\n📊 Probability Table (Winning Chances %)\n"));
        console.log(table.toString());
    }
}
