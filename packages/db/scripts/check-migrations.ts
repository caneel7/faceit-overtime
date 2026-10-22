import { spawnSync } from 'node:child_process';

const run = (cmd: string, args: string[]) =>
  spawnSync(cmd, args, { encoding: 'utf8', shell: process.platform === 'win32' });
const migrationsStatus = () => run('git', ['status', '--porcelain', '--', 'migrations']).stdout;

const before = migrationsStatus();
const generate = run('bunx', ['drizzle-kit', 'generate', '--name=pending']);
if (generate.status !== 0) {
  process.stderr.write(generate.stdout + generate.stderr);
  process.exit(generate.status ?? 1);
}

const after = migrationsStatus();
if (after !== before) {
  console.error(
    'The schema has changes with no migration. Review the generated "pending" migration, rename it and commit it:\n' +
      after,
  );
  process.exit(1);
}
console.log('Schema and migrations match.');
