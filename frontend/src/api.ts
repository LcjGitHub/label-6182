import type {
  CalendarMonthData,
  DeckPreset,
  DeckPresetInput,
  PracticeRecord,
  PracticeRecordInput,
  SpreadTemplate,
  SpreadTemplateInput,
  StatsData,
} from './types';

const API_BASE = '/api';

/**
 * 获取练习记录列表，支持关键词搜索
 * @param keyword - 搜索关键词（可选）
 */
export async function fetchRecords(keyword?: string): Promise<PracticeRecord[]> {
  const url = keyword?.trim()
    ? `${API_BASE}/records?keyword=${encodeURIComponent(keyword.trim())}`
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
 */
export async function fetchDeckPresets(): Promise<DeckPreset[]> {
  const res = await fetch(`${API_BASE}/deck-presets`);
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

/**
 * 获取全部牌阵模板
 */
export async function fetchSpreadTemplates(): Promise<SpreadTemplate[]> {
  const res = await fetch(`${API_BASE}/spread-templates`);
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
