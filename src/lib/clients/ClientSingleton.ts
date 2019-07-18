export abstract class ClientSingleton {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static createClient: (options?: any) => ClientSingleton;

  public static getClient: () => ClientSingleton;
}
