-- 꼬꼬 프로젝트 데이터베이스 스키마
-- Supabase SQL Editor에서 실행

-- images 테이블 (이미지 및 동영상 지원)
CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  title TEXT,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  is_selected BOOLEAN DEFAULT FALSE,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기존 테이블에 media_type 컬럼 추가 (마이그레이션용)
-- ALTER TABLE images ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video'));

-- 선택된 이미지는 하나만 가능
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_selected
ON images (is_selected)
WHERE is_selected = TRUE;

-- likes 테이블
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_likes_visitor
ON likes (visitor_id, created_at);

CREATE INDEX IF NOT EXISTS idx_likes_image
ON likes (image_id);

-- daily_like_stats 테이블 (그래프용)
CREATE TABLE IF NOT EXISTS daily_like_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  like_count INTEGER DEFAULT 0,
  UNIQUE(image_id, date)
);

CREATE INDEX IF NOT EXISTS idx_stats_image_date
ON daily_like_stats (image_id, date);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
