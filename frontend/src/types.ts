/** 塔罗练习记录实体 */
export interface PracticeRecord {
  id: number;
  date: string;
  spread_name: string;
  deck: string;
  key_cards: string;
  summary: string;
  created_at: string;
  updated_at: string;
}

/** 创建/更新练习记录时的请求体 */
export type PracticeRecordInput = Omit<
  PracticeRecord,
  'id' | 'created_at' | 'updated_at'
>;
