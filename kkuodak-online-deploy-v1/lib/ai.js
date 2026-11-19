
import { readState } from './db.js';

export async function askAI(req, kind) {
  if (!process.env.OPENAI_API_KEY) {
    throw Error('OPENAI_API_KEY 설정 필요');
  }

  let state = { brand: {}, rules: [] };

  // DB 장애가 발생해도 AI 요청은 계속 진행
  try {
    state = await readState();
  } catch (error) {
    console.error('Supabase 조회 실패:', error.message);
  }

  const rules = (state.rules || [])
    .map(r => '- ' + String(r.text || ''))
    .join('\n');

  const base = `
꾸오닭 브랜드 AI.
검증되지 않은 제품 정보를 지어내지 않는다.
확인된 브랜드 정보: ${JSON.stringify(state.brand || {})}
브랜드 정책:
${rules}
정책을 임의로 수정하지 않는다.
`;

  const designer = kind === 'design';

  const system = base + (designer
    ? `
15년 차 FMCG 콘텐츠 디자이너.
자연스러운 상업 디자인 카피를 제안한다.
JSON 객체만 출력:
{"headline":"...","subcopy":"...","direction":"..."}
실제 이미지 생성은 하지 않는다.`
    : `
12년 차 D2B2C 식품 마케팅 매니저.
실무적이고 매출 중심으로 한국어 답변한다.`);

  let msgs;

  if (designer) {
    const prompt = String(req.body?.prompt || '').slice(0, 2500);
    if (!prompt) throw Error('요청 내용을 입력하세요.');

    msgs = [{ role: 'user', content: prompt }];
  } else {
    msgs = (req.body?.history || [])
      .slice(-14)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.text || '').slice(0, 4000)
      }));

    if (!msgs.length) throw Error('대화 내용을 입력하세요.');
  }

  let response;

  try {
    response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
          messages: [
            { role: 'system', content: system },
            ...msgs
          ],
          temperature: 0.45
        }),
        signal: AbortSignal.timeout(25000)
      }
    );
  } catch (error) {
    console.error('OpenAI 네트워크 오류:', error);
    throw Error(`OpenAI 서버 연결 실패: ${error.message}`);
  }

  const output = await response.json();

  if (!response.ok) {
    throw Error(
      `OpenAI API 오류 ${response.status}: ` +
      (output?.error?.message || '요청 실패')
    );
  }

  return output.choices?.[0]?.message?.content || '';
}
