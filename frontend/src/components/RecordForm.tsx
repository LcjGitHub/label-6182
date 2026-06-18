import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { fetchDeckPresets, fetchSpreadTemplates } from '../api';
import type { PracticeRecordInput, SpreadTemplate } from '../types';

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
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const { data: deckPresets, isLoading: decksLoading } = useQuery({
    queryKey: ['deckPresets'],
    queryFn: fetchDeckPresets,
  });

  const { data: spreadTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ['spreadTemplates'],
    queryFn: fetchSpreadTemplates,
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

  const handleSelectTemplate = (template: SpreadTemplate) => {
    setValues((prev) => ({ ...prev, spread_name: template.name }));
    setTemplateDialogOpen(false);
  };

  const deckOptions = deckPresets ?? [];
  const currentDeckInOptions = deckOptions.some((d) => d.name === values.deck);
  const templateOptions = spreadTemplates ?? [];

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
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <TextField
              label="牌阵名"
              value={values.spread_name}
              onChange={handleChange('spread_name')}
              required
              fullWidth
            />
            <Button
              variant="outlined"
              startIcon={<ViewQuiltIcon />}
              onClick={() => setTemplateDialogOpen(true)}
              sx={{ whiteSpace: 'nowrap', height: 56 }}
            >
              从模板选择
            </Button>
          </Stack>
        </Box>
        {decksLoading ? (
          <Box display="flex" alignItems="center" py={1.5} gap={2}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              正在加载牌组预设…
            </Typography>
          </Box>
        ) : (
          <FormControl fullWidth required>
            <InputLabel id="deck-select-label">牌组</InputLabel>
            <Select
              labelId="deck-select-label"
              label="牌组"
              value={values.deck}
              onChange={handleSelectChange('deck')}
              displayEmpty
            >
              <MenuItem value="" disabled>
                请选择牌组
              </MenuItem>
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

      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>选择牌阵模板</DialogTitle>
        <DialogContent dividers>
          {templatesLoading ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              py={4}
              gap={2}
            >
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                正在加载牌阵模板…
              </Typography>
            </Box>
          ) : templateOptions.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              暂无可用的牌阵模板
            </Typography>
          ) : (
            <List sx={{ py: 0 }}>
              {templateOptions.map((template) => (
                <ListItem key={template.id} disablePadding divider>
                  <ListItemButton onClick={() => handleSelectTemplate(template)}>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body1" fontWeight={600}>
                            {template.name}
                          </Typography>
                          <Chip
                            label={`${template.card_count} 张`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      }
                      secondary={
                        template.scenario ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mt: 0.5,
                            }}
                          >
                            {template.scenario}
                          </Typography>
                        ) : null
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
