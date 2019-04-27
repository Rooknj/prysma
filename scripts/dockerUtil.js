"use strict";
// Enable console log statements in this file
/*eslint no-console:0*/

const packageJson = require("../package.json");
const parseArgs = require("minimist");
const spawn = require("cross-spawn");

const IMAGE_NAME = "rooknj/prysma";
const VERSION = packageJson.version;

const getDockerImage = tag => {
  let dockerTag = tag;
  if (process.env.TRAVIS) {
    console.log("In CI");
    const tagName = process.env.TRAVIS_TAG;
    if (tagName) {
      dockerTag = VERSION;
    } else {
      const branchName = process.env.TRAVIS_BRANCH;
      if (branchName === "master") {
        dockerTag = "master";
      } else {
        dockerTag = "test";
      }
    }
  }
  return `${IMAGE_NAME}:${dockerTag}`;
};

const buildDockerImage = async tag => {
  const image = getDockerImage(tag);
  console.log("Building", image);
  const child = spawn("docker", ["build", "-t", image, "."], {
    stdio: ["inherit", "inherit", "inherit"],
    cwd: process.cwd(),
    env: process.env
  });
  child.on("exit", code => {
    if (code !== 0) process.exit(code);
  });
};

const publishDockerImage = async tag => {
  const image = getDockerImage(tag);
  console.log("Publishing", image);
  const child = spawn("docker", ["push", image], {
    stdio: ["inherit", "inherit", "inherit"],
    cwd: process.cwd(),
    env: process.env
  });
  child.on("exit", code => {
    if (code !== 0) process.exit(code);
  });
};

// Process all command line arguments
const processArgs = async argv => {
  const args = parseArgs(argv.slice(2));
  // a tag is required if not in CI
  if (!args.t && !process.env.TRAVIS) {
    console.log("Not in CI and no tag was given. Aborting");
    process.exit(1);
  }

  if (args._.find(arg => arg === "build")) {
    buildDockerImage(args.t);
  } else if (args._.find(arg => arg === "publish")) {
    publishDockerImage(args.t);
  } else {
    console.log("No valid options supplied. Aborting");
    process.exit(1);
  }
};

processArgs(process.argv);
