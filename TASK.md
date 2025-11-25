# 꼬꼬 프로젝트 태스크

## 프로젝트 개요
관리자(선우)가 선택한 이미지를 표시하고, 방문자가 좋아요를 누를 수 있는 웹 애플리케이션

## 기술 스택
- Frontend: React 19 + TypeScript + Vite
- UI: shadcn/ui + Tailwind CSS v4
- Chart: Recharts
- Backend: Supabase (Auth, Database, Storage)
- AI: Hugging Face API
- Deploy: Vercel

---

## 구현 단계

### Phase 1: 프로젝트 기반 설정
- [x] Tailwind CSS v4 설치
- [x] shadcn/ui 기본 컴포넌트 설치
- [x] React Router 설정
- [x] 폴더 구조 생성
- [x] 상수 파일 생성 (KKOKKO 키워드)
- [x] TypeScript 타입 정의
- [x] 기본 레이아웃 및 페이지 생성

### Phase 2: Supabase 설정
- [x] Supabase 프로젝트 생성 (수동)
- [x] Supabase 클라이언트 설정
- [x] 테이블 스키마 SQL (supabase/schema.sql)
- [x] RLS 정책 SQL (supabase/rls.sql)
- [x] Database Functions (supabase/functions.sql)

### Phase 3: 인증 기능
- [x] useAuth 훅 구현
- [x] LoginForm 완성
- [x] ProtectedRoute 구현

### Phase 4: 메인 페이지
- [x] Layout 컴포넌트
- [x] ImageCard (더블터치 좋아요)
- [x] LikeAnimation

### Phase 5: 좋아요 기능
- [x] 방문자 ID 생성
- [x] useLikes, useLikeLimit 훅
- [x] likeService

### Phase 6: 관리자 - 이미지 관리
- [x] ImageUploader
- [x] ImageManager
- [x] imageService
- [x] useImages 훅

### Phase 7: 관리자 - 통계 그래프
- [x] Recharts 설치
- [x] statsService (getDailyStats, getImageStats)
- [x] useStats 훅
- [x] LikeChart 컴포넌트

### Phase 8: AI 이미지 생성
- [x] Hugging Face 설정 (InferenceClient, FLUX.1-schnell 모델)
- [x] AIGenerator UI
- [x] aiService (generateImage, saveGeneratedImage)
- [x] useAIGeneration 훅

### Phase 9: 배포
- [x] Vercel 배포 설정 (vercel.json)
- [x] README.md 배포 가이드

---

## Slash Commands 목록

| 명령어 | 설명 |
|--------|------|
| `/setup-tailwind` | Tailwind CSS v4 설치 |
| `/setup-shadcn` | shadcn/ui 설치 |
| `/setup-router` | React Router 설정 |
| `/setup-supabase` | Supabase 클라이언트 |
| `/setup-structure` | 폴더 구조 생성 |
| `/impl-constants` | 상수 파일 |
| `/impl-types` | TypeScript 타입 |
| `/impl-auth` | 인증 기능 |
| `/impl-layout` | 레이아웃 |
| `/impl-homepage` | 메인 페이지 |
| `/impl-like` | 좋아요 기능 |
| `/impl-admin-images` | 이미지 관리 |
| `/impl-admin-chart` | 통계 그래프 |
| `/impl-ai-generator` | AI 생성 |
| `/db-schema` | DB 스키마 SQL |
| `/db-rls` | RLS 정책 SQL |
| `/db-functions` | DB 함수 SQL |

---

## 사전 준비 체크리스트
- [x] Supabase 프로젝트 생성
- [x] Hugging Face 토큰 발급
- [x] 관리자 이메일 설정
- [x] .env.local 파일 생성
