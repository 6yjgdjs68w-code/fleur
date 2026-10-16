import git from 'isomorphic-git';
import fs from 'fs';

const dir = process.cwd();

// Get status matrix
const status = await git.statusMatrix({ fs, dir });

// Add files
for (const [filepath, , worktreeStatus] of status) {
  if (worktreeStatus === 2 || worktreeStatus === 1) { // untracked or modified
    await git.add({ fs, dir, filepath });
    console.log(`Added: ${filepath}`);
  }
}

// Commit
const sha = await git.commit({
  fs,
  dir,
  message: 'feat: add Telegram CloudStorage user role persistence and boutique admin panel improvements',
  author: {
    name: 'Angelina Bogatova',
    email: 'angelina@users.noreply.github.com',
  },
});

console.log(`Committed: ${sha}`);
