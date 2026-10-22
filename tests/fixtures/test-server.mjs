import http from "node:http";

if (process.env.TEST_SERVER_MODE === "hang") setInterval(() => {}, 1_000);
else {
  const server = http.createServer((_, response) => response.end("ok"));
  server.listen(Number(process.env.PORT), "127.0.0.1");
  process.on("SIGTERM", () => server.close(() => process.exit(0)));
}
