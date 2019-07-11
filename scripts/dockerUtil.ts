/* eslint no-console:0 */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import { argv } from "yargs";
import execa from "execa";
// @ts-ignore
import { name, version } from "../package.json";

const IMAGE_NAME = `rooknj/${name}`;

const getDockerImage = (tag: string): string => {
  let dockerTag = tag;
  if (process.env.TRAVIS) {
    console.log("In CI");
    const tagName = process.env.TRAVIS_TAG;
    if (tagName) {
      dockerTag = version;
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

const buildDockerImage = async (tag: string): Promise<void> => {
  const image = getDockerImage(tag);
  console.log("Building", image);
  const child = execa("docker", ["build", "-t", image, "."], {
    stdio: ["inherit", "inherit", "inherit"],
    cwd: process.cwd(),
    env: process.env,
  });

  // If docker build fails, then exit with an error code
  child.on("exit", (code: number): void => {
    if (code !== 0) process.exit(code);
  });
};

const publishDockerImage = async (tag: string): Promise<void> => {
  const image = getDockerImage(tag);
  console.log("Publishing", image);
  const child = execa("docker", ["push", image], {
    stdio: ["inherit", "inherit", "inherit"],
    cwd: process.cwd(),
    env: process.env,
  });

  // If docker push fails, then exit with an error code
  child.on("exit", (code: number): void => {
    if (code !== 0) process.exit(code);
  });
};

// a tag is required if not in CI
if (!argv.t && !process.env.CI) {
  console.log("Not in CI and no tag was given. Aborting");
  process.exit(1);
}

if (argv._.find((arg: string): boolean => arg === "build")) {
  buildDockerImage(argv.t as string);
} else if (argv._.find((arg: string): boolean => arg === "publish")) {
  publishDockerImage(argv.t as string);
} else {
  console.log("No valid options supplied. Aborting");
  process.exit(1);
}
