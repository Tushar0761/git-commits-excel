const simpleGit = require('simple-git');
const git = simpleGit();
const readline = require('readline');

const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
      });


const findAllAuthor = (commits) =>
    new Set(commits.map((commit) => commit.author_name));

const promptForAuthor = (authorsName) => {
    console.log("---  Here is all the authors List...");

    authorsName.forEach((author, index) => console.log(index + 1, author));

    return new Promise((resolve) => {
        const ask = () => {
            rl.question("Which author do you want to search?\n", (input) => {
                const regex = new RegExp(input, "i");
                const matchedAuthor = authorsName.find((author) =>
                    regex.test(author)
                );

                if (matchedAuthor) {
                    console.log(`---- Analyzing author: ${matchedAuthor} ----`);
                    resolve(matchedAuthor);
                } else {
                    console.log(
                        "No author found with the name you provided. Please try again."
                    );
                    ask(); // Recursively prompt again if no match is found
                }
            });
        };
        ask();
    });
};

const prepareCommitData = async (commits) => {
    let rowData = [];
    let count = 0;

    for (let i = 1; i < commits.length; i++) {
        // Start from the second commit to compare with the previous one
        let { message: message1, hash: hash1, date: date1 } = commits[i];
        let { message: message2, hash: hash2, date: date2 } = commits[i - 1];

        date1 = new Date(date1).toLocaleString(); // current
        date2 = new Date(date2).toLocaleString(); // previous

        const diff = await git.diffSummary([hash2, hash1]);
        const { insertions, deletions } = diff;

        rowData.push({
            count: ++count,
            message: message1,
            date: date1,
            addedChars: insertions,
            removedLines: deletions,
            hash: hash1,
        });
    }
    return rowData;
};

module.exports = { prepareCommitData, findAllAuthor, promptForAuthor };
