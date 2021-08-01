#! /usr/bin/env node

import { program } from 'commander';

import https from 'https';

const IAM_ACTIONS = 'https://awspolicygen.s3.amazonaws.com/js/policies.js';

function normalize(raw: string): string {
    return raw.substring(raw.indexOf('=') + 1);
}

// requester
async function request(): Promise<AWSActionData> {
    return new Promise((resolve) => {
        https.get(IAM_ACTIONS, res => {
            let data: Array<Uint8Array> = [];
    
            res.on('data', chunk => {
                data.push(chunk);
            });
    
            res.on('end', () => {
                const temp = Buffer.concat(data).toString();
                const normalized = normalize(temp);
                resolve(JSON.parse(normalized));
            });
        });
    });
}

interface ActionContent {
    StringPrefix: string;
    Actions: Array<string>;
    ARNformat: string;
    ARNregex: string;
}

type Response = { [name: string]: ActionContent };
type AWSActionData = { serviceMap: Response };

function find(query: string, data: AWSActionData): Response | null {
    const { serviceMap } = data;

    for (let key in serviceMap) {
        const action = serviceMap[key];
        if (serviceMap[key].StringPrefix === query) {
            return { [key]: action };
        }
    }

    return null;
}

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

    const actions = await request();
    const result = find(serviceName, actions);

    if (!result) {
        console.info(`AWS service ${serviceName} does not exist`);
        process.exit(0);
    }

    console.info(result);
}

main().catch(error => {
    console.error('An error occurred during receiving and processing AWS policy actions', error);
});