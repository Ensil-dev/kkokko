-- 꼬꼬 프로젝트 RLS 정책
-- schema.sql 실행 후 실행

-- images 테이블 RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 이미지 조회 가능
CREATE POLICY "Anyone can view images" ON images
  FOR SELECT USING (true);

-- 관리자만 이미지 삽입 가능
CREATE POLICY "Admin can insert images" ON images
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
    OR auth.role() = 'service_role'
  );

-- 관리자만 이미지 수정 가능
CREATE POLICY "Admin can update images" ON images
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
    OR auth.role() = 'service_role'
  );

-- 관리자만 이미지 삭제 가능
CREATE POLICY "Admin can delete images" ON images
  FOR DELETE USING (
    auth.jwt() ->> 'email' = current_setting('app.admin_email', true)
    OR auth.role() = 'service_role'
  );

-- likes 테이블 RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 좋아요 조회 가능
CREATE POLICY "Anyone can view likes" ON likes
  FOR SELECT USING (true);

-- 모든 사용자가 좋아요 추가 가능
CREATE POLICY "Anyone can insert likes" ON likes
  FOR INSERT WITH CHECK (true);

-- daily_like_stats 테이블 RLS
ALTER TABLE daily_like_stats ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 통계 조회 가능
CREATE POLICY "Anyone can view stats" ON daily_like_stats
  FOR SELECT USING (true);

-- service_role만 통계 수정 가능 (함수에서 처리)
CREATE POLICY "Service can modify stats" ON daily_like_stats
  FOR ALL USING (auth.role() = 'service_role');

-- Storage 버킷 생성 (Supabase 대시보드에서 실행하거나 아래 SQL)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('kkokko-images', 'kkokko-images', true)
-- ON CONFLICT DO NOTHING;

-- Storage 정책은 Supabase 대시보드에서 설정 권장
