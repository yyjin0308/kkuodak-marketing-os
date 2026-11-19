
const getConfig = () => {
  const rawUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl) {
    throw new Error('SUPABASE_URL 설정 필요');
  }

  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 설정 필요');
  }

  const baseUrl = rawUrl.trim().replace(/\/+$/, '');

  if (!baseUrl.startsWith('https://')) {
    throw new Error('SUPABASE_URL은 https:// 주소여야 합니다.');
  }

  return {
    url: `${baseUrl}/rest/v1/app_state?id=eq.1`,
    key
  };
};

async function query(method, body) {
  const { url, key } = getConfig();

  let response;

  try {
    response = await fetch(url, {
      method,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: body === undefined
        ? undefined
        : JSON.stringify(body),
      signal: AbortSignal.timeout(15000)
    });
  } catch (error) {
    console.error('Supabase connection error:', {
      name: error.name,
      message: error.message,
      cause: error.cause?.code || error.cause?.message
    });

    const cause = error.cause?.code || error.cause?.message || 'unknown';

    throw new Error(
      `Supabase 연결 실패: ${error.message} (${cause})`
    );
  }

  const text = await response.text();

  if (!response.ok) {
    console.error('Supabase HTTP error:', {
      status: response.status,
      body: text.slice(0, 300)
    });

    throw new Error(
      `Supabase API 오류 ${response.status}: ${text.slice(0, 180)}`
    );
  }

  try {
    return text ? JSON.parse(text) : [];
  } catch {
    throw new Error('Supabase 응답 JSON 처리 실패');
  }
}

export async function readState() {
  const rows = await query('GET');

  if (!rows.length) {
    throw new Error('app_state 테이블의 id=1 데이터가 없습니다.');
  }

  return rows[0].body;
}

export async function writeState(data) {
  const rows = await query('PATCH', { body: data });

  if (!rows.length) {
    throw new Error('데이터 저장에 실패했습니다.');
  }

  return true;
}

export function validateState(state) {
  return (
    state &&
    typeof state === 'object' &&
    !Array.isArray(state) &&
    Array.isArray(state.projects) &&
    Array.isArray(state.designs) &&
    Array.isArray(state.rules) &&
    state.brand &&
    typeof state.brand === 'object' &&
    Array.isArray(state.chat)
  );
}
