import express from 'express';
import { createPool } from 'mysql2/promise';
import type { Plugin, PreviewServer, ViteDevServer } from 'vite';

// 개발 서버와 빌드 미리보기에서 같은 읽기 전용 API를 사용한다.
export function rankingApi(env: Record<string, string>): Plugin {
  function mount(server: ViteDevServer | PreviewServer) {
    const pool = createPool({
      host: env.DB_HOST || '127.0.0.1',
      port: Number(env.DB_PORT || 3306),
      user: env.DB_USER || 'science_reader',
      password: env.DB_PASSWORD,
      database: env.DB_NAME || 'science_mystery_sample',
      connectionLimit: 4,
      connectTimeout: 3500,
    });
    const app = express();
    app.disable('x-powered-by');
    app.get('/api/rankings', async (_request, response) => {
      response.set('Cache-Control', 'no-store');
      try {
        const [rows] = await pool.execute(
          `SELECT p.nickname, gs.play_seconds AS playSeconds
           FROM game_sessions AS gs
           JOIN players AS p ON p.id = gs.player_id
           WHERE gs.play_seconds IS NOT NULL AND gs.accused_suspect_code = ?
           ORDER BY gs.play_seconds, gs.id
           LIMIT 10`,
          [env.DB_CORRECT_SUSPECT || 'cook'],
        );
        response.json(rows);
      } catch {
        response.status(503).json({ message: '랭킹을 불러오지 못했습니다.' });
      }
    });
    server.middlewares.use(app);
    server.httpServer?.once('close', () => void pool.end());
  }
  return { name: 'ranking-api', configureServer: mount, configurePreviewServer: mount };
}
