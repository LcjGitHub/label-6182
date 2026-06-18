import type { PracticeRecord, PracticeRecordInput } from './types';

const API_BASE = '/api';

/**
 * 获取全部练习记录
 */
export async function fetchRecords(): Promise<PracticeRecord[]> {
  const res = await fetch(`${API_BASE}/records`);
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
