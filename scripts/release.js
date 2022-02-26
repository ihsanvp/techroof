const { spawn, exec } = require("child_process");
const minimist = require("minimist");
const semver = require("semver");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const args = minimist(process.argv.slice(2));

const ALLOWED_ARGS = ["major", "minor", "patch"];

if (Object.keys(args).length <= 1) {
  console.warn("release type is required");
  process.exit(1);
}

Object.keys(args).forEach((key) => {
  if (key !== "_" && !ALLOWED_ARGS.includes(key)) {
    console.warn(`${key} is not allowed in args`);
    process.exit(1);
  }
});

function getVersionType() {
  if (args["major"]) return "major";
  if (args["minor"]) return "minor";
  if (args["patch"]) return "patch";
}

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

async function getLatestVersion() {
  let version = "0.0.0";

  try {
    const headers = {
      Accepts: "application/vnd.github.v3+json",
    };

    const res = await fetch(
      "https://api.github.com/repos/ihsanvp/techroof-test/releases/latest",
      headers
    );

    const data = await res.json();

    if (data.tag_name) {
      version = semver.valid(data.tag_name);
    }
  } catch {}

  return version;
}

async function run() {
  const gitStatus = await execCommand("git status");
  const gitRemote = await execCommand("git remote");
  const committed = gitStatus.includes("nothing to commit, working tree clean");

  if (!gitRemote.length > 0) {
    console.warn("git remote not set");
    process.exit(1);
  }

  if (!committed) {
    console.warn("changes not committed");
    process.exit(1);
  }

  const currentBranch = await execCommand("git branch --show-current");
  const currentVersion = await getLatestVersion();

  const version = semver.inc(currentVersion, getVersionType());
  const branch = `release/v${version}`;

  const command = spawn(
    `git checkout -b ${branch} && yarn app:version ${version} && git add --all && git commit -m "final" && git push -u origin ${branch}`,
    { shell: true }
  );

  command.on("exit", () => {
    exec(`git checkout ${currentBranch}`);
  });
}

run();
