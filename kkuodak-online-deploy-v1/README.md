# 꾸오닭 Marketing OS — 온라인 배포 v1.0

## 구성
- Vercel 정적 프런트엔드 + Node.js 서버리스 API
- Supabase PostgreSQL (브랜드, 프로젝트, 대화, 승인 정보의 단일 JSON 상태)
- OpenAI API (전략 회의/디자인 카피). **AI 이미지 자동 생성은 아직 미구현**
- 제품 패키지 4종: public/assets/ (원본 파일을 복사한 것)

## 처음 한 번만 설정
1. Supabase에서 새 프로젝트를 생성하고 SQL Editor에서 `supabase-setup.sql`을 실행합니다.
2. GitHub에 이 폴더의 파일을 업로드합니다. **`.env` 또는 마이그레이션 JSON을 GitHub에 업로드하지 마세요.** 저장소는 Private 권장.
3. Vercel에서 GitHub 저장소를 Import합니다. Framework Preset은 Other, Root Directory는 저장소 루트로 둡니다.
4. Vercel Project Settings → Environment Variables에서 `.env.example`에 나온 여섯 변수를 설정합니다. `SUPABASE_SERVICE_ROLE_KEY`는 Supabase Project Settings → API Keys의 서버용 비밀 키를 사용하고, 절대 브라우저/프런트엔드에 입력하지 마세요.
5. Deploy 후 제공된 `*.vercel.app` 주소에 접속합니다. `ADMIN_PASSWORD`로 로그인합니다.
6. 상단 **기존 데이터 가져오기**에서 별도로 제공한 `kkuodak-migration.json`을 업로드합니다. 기존 온라인 데이터가 교체되므로 최초 1회만 진행하세요.

## 업데이트
같은 GitHub 저장소에 코드를 수정·푸시하면 Vercel이 새 버전을 배포합니다. 데이터는 Supabase에 유지됩니다. 별도의 ZIP 재설치는 필요 없습니다.

## 보안 및 제약
- 모든 API 엔드포인트는 HttpOnly Secure 서명 쿠키 인증을 사용합니다. 비밀번호와 키는 Vercel 환경변수에만 저장합니다.
- 앱 HTML/제품 이미지는 공개 접근 가능하지만 브랜드 DB와 AI 엔드포인트는 로그인 필수입니다. 패키지 이미지를 비공개로 유지해야 한다면 비공개 스토리지로 전환해야 합니다.
- 단일 관리자용 MVP이며 동시 편집 충돌 방지, 비밀번호 변경 UI, 세밀한 권한, 버전별 이미지 저장, 백업 자동화는 미구현입니다.
- 저장된 시안은 텍스트/상태 메타데이터이며 PNG 이미지 자체는 클라우드에 저장되지 않습니다. PNG는 별도로 내려받으세요.
- 정적 페이지와 서버리스 API를 실제 Vercel 계정에서 배포·검증한 것은 아닙니다. 배포 후 로그인, 저장, AI, PNG를 테스트해야 합니다.
- OpenAI API 사용료, Supabase/Vercel 요금은 서비스 이용량에 따라 발생할 수 있습니다.
