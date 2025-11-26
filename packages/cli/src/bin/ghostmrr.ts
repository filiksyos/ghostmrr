#!/usr/bin/env node

import { Command } from 'commander';
import { verifyCommand } from '../commands/verify.js';
import { checkCommand } from '../commands/check.js';
import { didShowCommand, didResetCommand } from '../commands/did.js';

const program = new Command();

program
  .name('ghostmrr')
  .description('Verify your startup MRR without exposing Stripe data')
  .version('0.1.0');

program
  .command('verify')
  .description('Query Stripe, calculate MRR, and generate signed verification badge')
  .action(verifyCommand);

program
  .command('check <file>')
  .description('Verify a verification.json file locally')
  .action(checkCommand);

const didCommand = program
  .command('did')
  .description('Manage your persistent DID (Decentralized Identifier)');

didCommand
  .command('show')
  .description('Display your current DID and public key')
  .action(didShowCommand);

didCommand
  .command('reset')
  .description('Reset your DID (generates a new keypair)')
  .action(didResetCommand);

program.parse();
