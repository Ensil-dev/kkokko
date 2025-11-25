-- 꼬꼬 프로젝트 Database Functions
-- schema.sql, rls.sql 실행 후 실행

-- 좋아요 추가 함수 (10분 제한 체크 포함)
CREATE OR REPLACE FUNCTION add_like(
  p_image_id UUID,
  p_visitor_id TEXT
)
RETURNS JSON AS $$
DECLARE
  last_like_time TIMESTAMP WITH TIME ZONE;
  new_like_id UUID;
  remaining_secs INTEGER;
BEGIN
  -- 최근 10분 내 좋아요 확인
  SELECT created_at INTO last_like_time
  FROM likes
  WHERE visitor_id = p_visitor_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF last_like_time IS NOT NULL AND
     last_like_time > NOW() - INTERVAL '10 minutes' THEN
    remaining_secs := EXTRACT(EPOCH FROM (last_like_time + INTERVAL '10 minutes' - NOW()))::INT;
    RETURN json_build_object(
      'success', false,
      'message', '10분에 1개의 좋아요만 가능합니다',
      'remaining_seconds', remaining_secs
    );
  END IF;

  -- 좋아요 추가
  INSERT INTO likes (image_id, visitor_id)
  VALUES (p_image_id, p_visitor_id)
  RETURNING id INTO new_like_id;

  -- daily_like_stats 업데이트
  INSERT INTO daily_like_stats (image_id, date, like_count)
  VALUES (p_image_id, CURRENT_DATE, 1)
  ON CONFLICT (image_id, date)
  DO UPDATE SET like_count = daily_like_stats.like_count + 1;

  RETURN json_build_object(
    'success', true,
    'like_id', new_like_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 이미지별 좋아요 수 조회 함수
CREATE OR REPLACE FUNCTION get_image_like_count(p_image_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM likes
  WHERE image_id = p_image_id;

  RETURN total_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 이미지 선택 함수 (기존 선택 해제 후 새로 선택)
CREATE OR REPLACE FUNCTION select_image(p_image_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- 기존 선택 해제
  UPDATE images SET is_selected = FALSE WHERE is_selected = TRUE;

  -- 새 이미지 선택
  UPDATE images SET is_selected = TRUE WHERE id = p_image_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
