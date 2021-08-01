#! /usr/bin/env node

import { program } from 'commander';

// requester class

// validate process vars

// define a program
program
    .version('0.0.1')
    .usage('[options] <serviceName>');

program.parse(process.argv);

async function main(): Promise<void> {
    const [ serviceName ] = program.args;

    if (!serviceName) {
        throw new Error('Please provice AWS service name');
    }

    console.info('success', serviceName);
}

main().catch(error => {
    console.error('An error occurred during receiving and processing AWS policy actions', error);
});