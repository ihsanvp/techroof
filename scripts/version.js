const semver = require("semver");
const toml = require("toml-patch");
const fs = require("fs");
const path = require("path");
const appPackage = require("../package.json");

if (process.argv.length <= 2) {
  console.warn("version number is required");
  process.exit(1);
}

if (!semver.valid(process.argv[2])) {
  console.warn("invalid version number");
  process.exit(1);
}

const locations = {
  packageJson: path.resolve(__dirname, "../package.json"),
  cargoToml: path.resolve(__dirname, "../src-tauri/Cargo.toml"),
  tauriConfig: path.resolve(__dirname, "../src-tauri/tauri.conf.json"),
};

async function run() {
  const version = semver.valid(process.argv[2]);

  await updateJsonFile(locations.packageJson, (data) => {
    data.version = version;
    return data;
  });
  await updateJsonFile(locations.tauriConfig, (data) => {
    data.package.version = version;
    return data;
  });
  await updateTomlFile(locations.cargoToml, (data) => {
    data.package.version = version;
    return data;
  });

  console.log(`${appPackage.version} -> ${version}`);

  return version;
}

async function updateJsonFile(location, handleData) {
  const content = await fs.promises.readFile(location);
  const data = JSON.parse(content.toString());
  const final = handleData(data);

  await fs.promises.writeFile(location, JSON.stringify(final, undefined, 2));
}

async function updateTomlFile(location, handleData) {
  const content = await fs.promises.readFile(location);
  const data = toml.parse(content.toString());
  const final = handleData(data);

  await fs.promises.writeFile(location, toml.stringify(final));
}

run();
