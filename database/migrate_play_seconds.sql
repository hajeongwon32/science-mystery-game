-- 이전 db_sample.sql로 만든 샘플 DB에서 한 번만 실행한다.
USE science_mystery_sample;

ALTER TABLE game_sessions ADD COLUMN play_seconds INT UNSIGNED NULL AFTER started_at;

UPDATE game_sessions
SET play_seconds = TIMESTAMPDIFF(SECOND, started_at, finished_at)
WHERE finished_at IS NOT NULL AND id > 0;

-- 변환한 값을 검사하고 기존 종료 시각 컬럼을 제거한다.
ALTER TABLE game_sessions
    DROP CHECK chk_sessions_finish,
    DROP COLUMN finished_at,
    MODIFY started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD CONSTRAINT chk_sessions_duration CHECK (
        (play_seconds IS NULL) = (accused_suspect_code IS NULL)
    );
