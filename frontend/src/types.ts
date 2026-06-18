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

/** 牌组预设实体 */
export interface DeckPreset {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

/** 创建/更新牌组预设时的请求体 */
export type DeckPresetInput = Omit<
  DeckPreset,
  'id' | 'created_at' | 'updated_at'
>;

/** 牌阵模板实体 */
export interface SpreadTemplate {
  id: number;
  name: string;
  scenario: string;
  card_count: number;
  created_at: string;
  updated_at: string;
}

/** 创建/更新牌阵模板时的请求体 */
export type SpreadTemplateInput = Omit<
  SpreadTemplate,
  'id' | 'created_at' | 'updated_at'
>;

/** 按月统计条目 */
export interface MonthlyStat {
  month: string;
  count: number;
}

/** 按名称统计条目（牌组 / 牌阵） */
export interface NamedStat {
  name: string;
  count: number;
}

/** 练习统计数据 */
export interface StatsData {
  monthly: MonthlyStat[];
  by_deck: NamedStat[];
  by_spread: NamedStat[];
}

/** 日历单日数据 */
export interface CalendarDateItem {
  date: string;
  count: number;
}

/** 日历月度数据 */
export interface CalendarMonthData {
  year: number;
  month: number;
  dates: CalendarDateItem[];
}

/** 列表排序方式 */
export type SortOption = 'date_desc' | 'date_asc' | 'name_asc';
