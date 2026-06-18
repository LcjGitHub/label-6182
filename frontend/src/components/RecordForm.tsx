import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { fetchDeckPresets } from '../api';
import type { PracticeRecordInput } from '../types';

interface RecordFormProps {
  /** 初始表单值，编辑模式传入 */
  initialValues?: PracticeRecordInput;
  /** 提交中状态 */
  submitting?: boolean;
  /** 服务端或校验错误信息 */
  errorMessage?: string | null;
  /** 表单提交回调 */
  onSubmit: (values: PracticeRecordInput) => void;
  /** 取消回调 */
  onCancel: () => void;
}

const emptyValues: PracticeRecordInput = {
  date: dayjs().format('YYYY-MM-DD'),
  spread_name: '',
  deck: '',
  key_cards: '',
  summary: '',
};

/**
 * 练习记录表单（新建/编辑共用）
 */
export default function RecordForm({
  initialValues,
  submitting = false,
  errorMessage,
  onSubmit,
  onCancel,
}: RecordFormProps) {
  const [values, setValues] = useState<PracticeRecordInput>(
    initialValues ?? emptyValues,
  );

  const { data: deckPresets, isLoading: decksLoading } = useQuery({
    queryKey: ['deckPresets'],
    queryFn: fetchDeckPresets,
  });

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues);
    }
  }, [initialValues]);

  const handleChange =
    (field: keyof PracticeRecordInput) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSelectChange =
    (field: keyof PracticeRecordInput) =>
    (event: { target: { value: unknown } }) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value as string }));
    };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(values);
  };

  const deckOptions = deckPresets ?? [];
  const currentDeckInOptions = deckOptions.some((d) => d.name === values.deck);

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2.5}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <TextField
          label="日期"
          type="date"
          value={values.date}
          onChange={handleChange('date')}
          InputLabelProps={{ shrink: true }}
          required
          fullWidth
        />
        <TextField
          label="牌阵名"
          value={values.spread_name}
          onChange={handleChange('spread_name')}
          required
          fullWidth
        />
        {decksLoading ? (
          <Box display="flex" alignItems="center" py={1.5}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <span style={{ color: '#666' }}>加载牌组预设…</span>
          </Box>
        ) : (
          <FormControl fullWidth required>
            <InputLabel id="deck-select-label">牌组</InputLabel>
            <Select
              labelId="deck-select-label"
              label="牌组"
              value={values.deck}
              onChange={handleSelectChange('deck')}
            >
              {values.deck && !currentDeckInOptions && (
                <MenuItem value={values.deck}>{values.deck}</MenuItem>
              )}
              {deckOptions.map((preset) => (
                <MenuItem key={preset.id} value={preset.name}>
                  {preset.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <TextField
          label="关键牌"
          value={values.key_cards}
          onChange={handleChange('key_cards')}
          placeholder="例如：愚者、恋人、太阳"
          required
          fullWidth
        />
        <TextField
          label="解读摘要"
          value={values.summary}
          onChange={handleChange('summary')}
          required
          fullWidth
          multiline
          minRows={4}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onCancel} disabled={submitting}>
            取消
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? '保存中…' : '保存'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
