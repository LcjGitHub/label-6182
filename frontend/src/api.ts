import type {
  CalendarMonthData,
  DeckPreset,
  DeckPresetInput,
  PracticeRecord,
  PracticeRecordInput,
  SortOption,
  SpreadTemplate,
  SpreadTemplateInput,
  StatsData,
} from './types';

const API_BASE = '/api';

/**
 * 获取练习记录列表，支持关键词搜索和牌组筛选
 * @param keyword - 搜索关键词（可选）
 * @param deck - 牌组名称（可选）
 */
export async function fetchRecords(
  keyword?: string,
  deck?: string,
): Promise<PracticeRecord[]> {
  const params = new URLSearchParams();
  const trimmedKeyword = keyword?.trim();
  const trimmedDeck = deck?.trim();
  if (trimmedKeyword) params.append('keyword', trimmedKeyword);
  if (trimmedDeck) params.append('deck', trimmedDeck);
  const queryString = params.toString();
  const url = queryString
    ? `${API_BASE}/records?${queryString}`
    : `${API_BASE}/records`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('加载记录失败');
  }
  return res.json();
}

/**
 * 获取单条练习记录
 * @param id - 记录 ID
 */
export async function fetchRecord(id: number): Promise<PracticeRecord> {
  const res = await fetch(`${API_BASE}/records/${id}`);
  if (!res.ok) {
    throw new Error('记录不存在');
  }
  return res.json();
}

/**
 * 新建练习记录
 * @param data - 表单数据
 */
export async function createRecord(
  data: PracticeRecordInput,
): Promise<PracticeRecord> {
  const res = await fetch(`${API_BASE}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? '创建失败');
  }
  return res.json();
}

/**
 * 更新练习记录
 * @param id - 记录 ID
 * @param data - 表单数据
 */
export async function updateRecord(
  id: number,
  data: PracticeRecordInput,
): Promise<PracticeRecord> {
  const res = await fetch(`${API_BASE}/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? '更新失败');
  }
  return res.json();
}

/**
 * 删除练习记录
 * @param id - 记录 ID
 */
export async function deleteRecord(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/records/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error('删除失败');
  }
}

/**
 * 获取练习统计数据
 */
export async function fetchStats(): Promise<StatsData> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) {
    throw new Error('加载统计数据失败');
  }
  return res.json();
}

/**
 * 获取全部牌组预设
 * @param sort - 排序方式，默认日期降序
 */
export async function fetchDeckPresets(
  sort: SortOption = 'date_desc',
): Promise<DeckPreset[]> {
  const params = new URLSearchParams();
  params.append('sort', sort);
  const res = await fetch(`${API_BASE}/deck-presets?${params.toString()}`);
  if (!res.ok) {
    throw new Error('加载牌组预设失败');
  }
  return res.json();
}

/**
 * 新建牌组预设
 * @param data - 表单数据
 */
export async function createDeckPreset(
  data: DeckPresetInput,
): Promise<DeckPreset> {
  const res = await fetch(`${API_BASE}/deck-presets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? '创建失败');
  }
  return res.json();
}

/**
 * 更新牌组预设
 * @param id - 预设 ID
 * @param data - 表单数据
 */
export async function updateDeckPreset(
  id: number,
  data: DeckPresetInput,
): Promise<DeckPreset> {
  const res = await fetch(`${API_BASE}/deck-presets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? '更新失败');
  }
  return res.json();
}

/**
 * 删除牌组预设
 * @param id - 预设 ID
 */
export async function deleteDeckPreset(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/deck-presets/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error('删除失败');
  }
}

export async function batchDeleteDeckPresets(ids: number[]): Promise<number> {
  const res = await fetch(`${API_BASE}/deck-presets/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? '批量删除失败');
  }
  const data = await res.json();
  return data.deleted;
}

/**
 * 获取全部牌阵模板
 * @param sort - 排序方式，默认日期降序
 */
export async function fetchSpreadTemplates(
  sort: SortOption = 'date_desc',
): Promise<SpreadTemplate[]> {
  const params = new URLSearchParams();
  params.append('sort', sort);
  const res = await fetch(`${API_BASE}/spread-templates?${params.toString()}`);
  if (!res.ok) {
    throw new Error('加载牌阵模板失败');
  }
  return res.json();
}

/**
 * 获取单条牌阵模板
 * @param id - 模板 ID
 */
export async function fetchSpreadTemplate(id: number): Promise<SpreadTemplate> {
  const res = await fetch(`${API_BASE}/spread-templates/${id}`);
  if (!res.ok) {
    throw new Error('牌阵模板不存在');
  }
  return res.json();
}

/**
 * 新建牌阵模板
 * @param data - 表单数据
 */
export async function createSpreadTemplate(
  data: SpreadTemplateInput,
): Promise<SpreadTemplate> {
  const res = await fetch(`${API_BASE}/spread-templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? '创建失败');
  }
  return res.json();
}

/**
 * 更新牌阵模板
 * @param id - 模板 ID
 * @param data - 表单数据
 */
export async function updateSpreadTemplate(
  id: number,
  data: SpreadTemplateInput,
): Promise<SpreadTemplate> {
  const res = await fetch(`${API_BASE}/spread-templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? '更新失败');
  }
  return res.json();
}

/**
 * 删除牌阵模板
 * @param id - 模板 ID
 */
export async function deleteSpreadTemplate(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/spread-templates/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error('删除失败');
  }
}

export async function fetchCalendarMonth(year: number, month: number): Promise<CalendarMonthData> {
  const res = await fetch(`${API_BASE}/calendar?year=${year}&month=${month}`);
  if (!res.ok) {
    throw new Error('加载日历数据失败');
  }
  return res.json();
}

export async function fetchRecordsByDate(date: string): Promise<PracticeRecord[]> {
  const res = await fetch(`${API_BASE}/records/by-date?date=${encodeURIComponent(date)}`);
  if (!res.ok) {
    throw new Error('加载当日记录失败');
  }
  return res.json();
}
