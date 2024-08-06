import { test } from 'node:test';
import assert from 'node:assert';
import { commands } from '../../commands/commands.js';

const commands_to_check = ['add', 'create_campaign', 'select_announcements_channel'];
test('commands should contain the following commands', () => {
  assert.deepStrictEqual(Object.keys(commands), commands_to_check);
});