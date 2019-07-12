import express from "express";
import http from "http";
import path from "path";

/* Create a reusable server class that will bootstrap basic express application. */
class Server {
  /* Most of the core properties below have their types defined by already existing interfaces. IDEs users can jump directly to interface definition by clicking on its name.  */
  /* protected member will be accessible from deriving classes.  */
  protected app: express.Application;

  /* And here we are using http module Server class as a type. */
  protected server!: http.Server;

  /* restrict member scope to Server class only */
  private routes: string[] = [];

  /* public modifier is a default and can be omitted. I prefer to always set it, so code  style is more consistent. */
  public port: string | number;

  public constructor(port: string | number = 4001) {
    this.app = express();
    this.port = port;
    this.app.set("port", port);
    this.config();
  }

  private config(): void {
    // disable x-powered-by
    this.app.disable("x-powered-by");

    // Set up static UI files
    this.app.use(express.static(path.join(__dirname, "..", "..", "ui")));

    // Default every route except the above API routes to send index.html
    this.app.get("*", (_, res): void => {
      res.sendFile(path.join(__dirname, "..", "..", "ui", "index.html"));
    });

    // set bodyParser middleware to get form data
    // this.app.use(bodyParser.json());
    // this.app.use(bodyParser.urlencoded({ extended: true }));

    // HTTP requests logger
    // this.app.use(logger("dev"));

    this.server = http.createServer(this.app);

    // if (!process.env.PRODUCTION) {
    //   dotenv.config({ path: ".env.dev" });
    // }
  }

  public addRoute(routeUrl: string, routerHandler: express.Router): void {
    if (this.routes.indexOf(routeUrl) === -1) {
      this.routes.push(routeUrl);
      this.app.use(routeUrl, routerHandler);
    }
  }

  public getRoutes(): string[] {
    return this.routes;
  }

  public start(): void {
    this.app.listen(this.app.get("port"), (): void => {
      console.log(
        "  App is running at http://localhost:%d in %s mode",
        this.app.get("port"),
        this.app.get("env")
      );
      console.log("  Press CTRL-C to stop\n");
    });
  }
}

export default Server;
