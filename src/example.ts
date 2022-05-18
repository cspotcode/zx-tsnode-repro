import { exit } from 'process';
import {$, fs, ProcessOutput} from 'zx';

async function workTreeIsClean() {
  try{
    await $`git diff-index --quiet HEAD .`;
    return true; // zero exit code : tree clean
  }
  catch(err){
    if(err instanceof ProcessOutput && err.exitCode !== 0){
      return false; // non zero : tree unclean
    }
    throw err; // unexpected error
  }
}

async function loadPackageJson() {
  const packageJson = await fs.readJSON('./package.json');
  return packageJson as {
    name: string;
    version: string;
  };
}

async function bumpPackageVersion() {
  if (!(await workTreeIsClean())) {
    console.log('You have uncommitted files in your git worktree. Halting')
    exit(1);
  }
  await $`npm version patch`;
  const { version } = await loadPackageJson();
  await $`git commit -m "Increment version to '${version}'" package.json`;
  await $`git push`;
}

async function release() {
  await bumpPackageVersion();
}

void release();