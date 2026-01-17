import request from 'supertest';
import { testRef } from '../setup';
import { UserService } from '../../src/models/user/user.service';
import { CreateUserDto } from '../../src/models/user/dto/create-user.dto';

describe('Auth E2E', () => {
  const userPayload: CreateUserDto = {
    email: 'admin@epaper.com',
    password: '123456',
    firstName: 'Admin',
    lastName: 'User',
  };

  let accessToken: string;
  let refreshToken: string;

  const login = (payload = {email: userPayload.email, password: userPayload.password}) =>
    request(testRef.app.getHttpServer())
      .post('/auth/login')
      .send(payload);

  const refresh = (token: string) =>
    request(testRef.app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${token}`);

  const signOut = (token: string) =>
    request(testRef.app.getHttpServer())
      .post('/auth/signout')
      .set('Authorization', `Bearer ${token}`);


  beforeEach(async () => {
    await testRef.app.get(UserService).create(userPayload);
  });

  describe('POST /auth/login', () => {
    it('deve realizar login com credenciais válidas', async () => {
      const res = await login();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('deve falhar com senha inválida', async () => {
      const res = await login({
        ...userPayload,
        password: 'senha_errada',
      });

      expect(res.status).toBe(401);
    });

    it('deve falhar com email inexistente', async () => {
      const res = await login({
        email: 'inexistente@epaper.com',
        password: '123456',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    beforeEach(async () => {
      const res = await login();
      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it('deve falhar com refresh token inválido', async () => {
      const res = await refresh('token_invalido');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/signout', () => {
    beforeEach(async () => {
      const res = await login();
      accessToken = res.body.accessToken;
    });

    it('deve realizar logout com sucesso', async () => {
      const res = await signOut(accessToken);

      expect(res.status).toBe(201);
    });

    it('deve impedir acesso após logout', async () => {
      await signOut(accessToken);

      const res = await request(testRef.app.getHttpServer())
        .post('/auth/signout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(201);
    });
  });

  describe('Proteção JWT', () => {
    it('deve bloquear rota protegida sem token', async () => {
      const res = await request(testRef.app.getHttpServer())
        .post('/auth/signout');

      expect(res.status).toBe(401);
    });
  });
});
