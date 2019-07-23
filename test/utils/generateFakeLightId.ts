import faker from "faker";

export const generateFakeLightId = (): string =>
  `Prysma-${faker.internet
    .mac()
    .split(":")
    .join("")
    .toUpperCase()}`;
