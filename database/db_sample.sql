-- 창밖에 있던 사람 | 제출용 MySQL 샘플
-- MySQL 8.0.16 이상, utf8mb4
-- mysql> SOURCE database/db_sample.sql;
-- 기존 finished_at 샘플 DB는 migrate_play_seconds.sql을 먼저 한 번 실행한다.
-- 이 파일은 전용 샘플 스키마에 테이블과 가상 플레이 기록을 만든다.

-- 1. 샘플 DB를 만들고 한글 닉네임을 쓸 수 있도록 문자셋을 설정한다.
CREATE DATABASE IF NOT EXISTS science_mystery_sample
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;
USE science_mystery_sample;
SET NAMES utf8mb4;

-- 2. 플레이어마다 ID를 자동으로 발급한다. UNIQUE로 닉네임 중복을 막는다.
CREATE TABLE IF NOT EXISTS players (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nickname VARCHAR(20) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_players_nickname UNIQUE (nickname)
) ENGINE = InnoDB;

-- 게임 한 판당 한 행을 저장한다. player_id는 그 판을 시작한 플레이어를 가리킨다.
CREATE TABLE IF NOT EXISTS game_sessions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    player_id BIGINT UNSIGNED NOT NULL,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    play_seconds INT UNSIGNED NULL,
    accused_suspect_code VARCHAR(30) CHARACTER SET ascii COLLATE ascii_bin NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_sessions_player
        FOREIGN KEY (player_id) REFERENCES players (id),
    -- 지목할 때 소요 시간과 용의자 코드를 함께 저장한다.
    CONSTRAINT chk_sessions_duration CHECK (
        (play_seconds IS NULL) = (accused_suspect_code IS NULL)
    ),
    -- 지목 코드는 게임에 등장하는 네 용의자 중 하나여야 한다.
    CONSTRAINT chk_sessions_suspect
        CHECK (accused_suspect_code IN ('captain', 'navigator', 'cook', 'engineer'))
) ENGINE = InnoDB;

-- 3. 가상 플레이어와 플레이 기록을 한 트랜잭션으로 저장한다.
START TRANSACTION;

-- 이미 등록된 샘플 닉네임은 기존 플레이어를 재사용한다.
INSERT INTO players (nickname) VALUES
    ('바다탐정'),
    ('물결기록'),
    ('새벽항해'),
    ('갑판일지'),
    ('등대지기')
ON DUPLICATE KEY UPDATE id = players.id;

-- UNION ALL로 가상 기록 5건을 모은다. 완료한 판 4건과 진행 중인 판 1건이다.
-- 샘플 ID를 고정해 같은 파일을 다시 실행해도 샘플 기록이 추가되지 않는다.
INSERT INTO game_sessions (id, player_id, started_at, play_seconds, accused_suspect_code)
SELECT seed.id, p.id, seed.started_at, seed.play_seconds, seed.accused_suspect_code
FROM (
    SELECT
        1 AS id,
        '바다탐정' AS nickname,
        '2026-11-26 10:00:00' AS started_at,
        645 AS play_seconds,
        'cook' AS accused_suspect_code
    UNION ALL SELECT 2, '물결기록', '2026-11-26 10:02:00', 690, 'cook'
    UNION ALL SELECT 3, '새벽항해', '2026-11-26 10:04:00', 690, 'cook'
    UNION ALL SELECT 4, '갑판일지', '2026-11-26 10:06:00', 615, 'captain'
    UNION ALL SELECT 5, '등대지기', '2026-11-26 10:08:00', NULL, NULL
) AS seed
-- 샘플 닉네임으로 플레이어 ID를 찾아 game_sessions에 저장한다.
JOIN players AS p ON p.nickname = seed.nickname
ON DUPLICATE KEY UPDATE id = game_sessions.id;

COMMIT;

-- 4. 완료 기록을 조회할 때 쓸 시연용 정답 코드다.
-- 실제 게임의 정답은 서버에서 관리한다.
SET @sample_correct_suspect_code = _ascii'cook' COLLATE ascii_bin;

-- 최종 지목을 구현할 때 서버에서 사용할 갱신 예시. 재제출해도 기록은 바뀌지 않는다.
-- UPDATE game_sessions
-- SET play_seconds = TIMESTAMPDIFF(SECOND, started_at, CURRENT_TIMESTAMP), accused_suspect_code = ?
-- WHERE id = ? AND play_seconds IS NULL;

-- 해결한 기록 중 빠른 10건. 동률이면 플레이 ID가 작은 기록이 앞선다.
SELECT
    ROW_NUMBER() OVER (ORDER BY gs.play_seconds, gs.id) AS ranking,
    p.nickname,
    gs.play_seconds
FROM game_sessions AS gs
JOIN players AS p ON p.id = gs.player_id
WHERE gs.play_seconds IS NOT NULL AND gs.accused_suspect_code = @sample_correct_suspect_code
ORDER BY gs.play_seconds, gs.id
LIMIT 10;
