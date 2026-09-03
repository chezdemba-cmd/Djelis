import "dotenv/config";
import { createApp } from "./bootstrap";

async function bootstrap() {
  const app = await createApp();
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Djeli'S API is running on: http://localhost:${port}/api/v1`);
}

bootstrap().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
