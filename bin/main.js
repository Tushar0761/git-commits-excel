#!/usr/bin/env node

const readline = require('readline');
const simpleGit = require('simple-git');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { prepareCommitData, findAllAuthor, promptForAuthor } = require('../lib/commitStats');

const git = simpleGit();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const csvWriter = createCsvWriter({
    path: 'commit_stats.csv',
    header: [
        { id: 'count', title: 'Sr' },
        { id: 'message', title: 'Commit Message' },
        { id: 'date', title: 'Commit Date' },
        { id: 'addedChars', title: 'Added Lines' },
        { id: 'removedLines', title: 'Removed Lines' },
        { id: 'hash', title: 'Hash' },
    ],
});

async function getCommitStats() {
    try {
        const log = await git.log();

        let commits = log.all.reverse();
        
        const authorsName = [...findAllAuthor(commits)];

        const matchedAuthor = await promptForAuthor(authorsName);

        commits = commits.filter((c) => c.author_name === matchedAuthor);

        const commitData = await prepareCommitData(commits);

        console.time('Write in CSV');
        await csvWriter.writeRecords(commitData);
        console.timeEnd('Write in CSV');
        console.log('CSV file created successfully.');
        rl.close();
    } catch (err) {
        console.error('Error generating commit stats:', err);
        rl.close();
    }
}

getCommitStats();
