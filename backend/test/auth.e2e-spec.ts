import "dotenv/config";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

jest.setTimeout(30000);

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: "password123",
  };
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it("/api/v1/auth/register (POST) - Success", () => {
    return request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined();
        expect(res.body.user.email).toEqual(testUser.email);
        accessToken = res.body.access_token;
      });
  });

  it("/api/v1/auth/register (POST) - Duplicate Email", () => {
    return request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send(testUser)
      .expect(409); // Conflict
  });

  it("/api/v1/auth/login (POST) - Success", () => {
    return request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined();
      });
  });

  it("/api/v1/auth/login (POST) - Bad Password", () => {
    return request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({
        email: testUser.email,
        password: "wrongpassword",
      })
      .expect(401);
  });

  it("/api/v1/profiles (GET) - Unauthorized without token", () => {
    return request(app.getHttpServer()).get("/api/v1/profiles").expect(401);
  });

  it("/api/v1/profiles (GET) - Success with token", () => {
    return request(app.getHttpServer())
      .get("/api/v1/profiles")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
  });
});
