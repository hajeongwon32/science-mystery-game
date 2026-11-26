import { useEffect, useRef, useState } from 'react';

type Entry = { nickname: string; playSeconds: number };

export default function RankingDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const offline = window.location.protocol === 'file:';

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  useEffect(() => {
    if (offline) return;
    const controller = new AbortController();
    async function load() {
      setStatus('loading');
      try {
        const response = await fetch('/api/rankings', { signal: controller.signal });
        if (!response.ok) throw new Error('ranking unavailable');
        const rows: Entry[] = await response.json();
        if (!controller.signal.aborted) {
          setEntries(rows);
          setStatus('ready');
        }
      } catch {
        if (!controller.signal.aborted) setStatus('error');
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt, offline]);

  return (
    <dialog
      className="crew-book rankings"
      ref={dialog}
      aria-labelledby="ranking-title"
      onClose={onClose}
    >
      <header>
        <h2 id="ranking-title">사건 해결 랭킹</h2>
        <button type="button" onClick={() => dialog.current?.close()}>
          닫기
        </button>
      </header>
      <div aria-live="polite">
        {offline ? (
          <p>랭킹은 게임 서버에 접속하면 볼 수 있습니다.</p>
        ) : (
          <>
            {status === 'loading' && <p>기록을 불러오는 중…</p>}
            {status === 'error' && (
              <p>
                기록을 불러오지 못했습니다.{' '}
                <button type="button" onClick={() => setAttempt(attempt + 1)}>
                  다시 시도
                </button>
              </p>
            )}
            {status === 'ready' &&
              (entries.length === 0 ? (
                <p>아직 사건을 해결한 기록이 없습니다.</p>
              ) : (
                <table>
                  <caption>사건을 빠르게 해결한 상위 10개 기록</caption>
                  <thead>
                    <tr>
                      <th>순위</th>
                      <th>닉네임</th>
                      <th>플레이 시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(({ nickname, playSeconds }, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{nickname}</td>
                        <td>
                          {Math.floor(playSeconds / 60)}분 {playSeconds % 60}초
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
          </>
        )}
      </div>
    </dialog>
  );
}
