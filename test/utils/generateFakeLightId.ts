import faker from "faker";

export const generateFakeLightId = (): string => {
  // Seed faker with a value that is unique on every call
  // process.hrtime is different even on same line calls
  faker.seed(process.hrtime()[1]);
  // Generate a fake light ID in the expected format of Prysma-AABBCCDDEEFF
  const uniqueLightId = `Prysma-${faker.internet
    .mac()
    .split(":")
    .join("")
    .toUpperCase()}`;
  return uniqueLightId;
};
