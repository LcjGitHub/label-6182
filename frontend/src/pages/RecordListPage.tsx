import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { deleteRecord, fetchRecords } from '../api';
import type { PracticeRecord } from '../types';

/**
 * 格式化展示日期
 * @param date - ISO 日期字符串
 */
function formatDate(date: string): string {
  return dayjs(date).format('YYYY年M月D日');
}

/** 练习记录列表页 */
export default function RecordListPage() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<PracticeRecord | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [selectedDeck, setSelectedDeck] = useState('');

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['records', submittedKeyword, selectedDeck],
    queryFn: () => fetchRecords(submittedKeyword, selectedDeck),
  });

  const deckOptions = Array.from(
    new Set((data ?? []).map((r) => r.deck).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, 'zh-CN'));

  const handleSearch = () => {
    setSubmittedKeyword(searchKeyword.trim());
  };

  const handleClear = () => {
    setSearchKeyword('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDeckChange = (e: SelectChangeEvent<string>) => {
    setSelectedDeck(e.target.value);
  };

  useEffect(() => {
    if (searchKeyword === '' && submittedKeyword !== '') {
      setSubmittedKeyword('');
    }
  }, [searchKeyword, submittedKeyword]);

  const deleteMutation = useMutation({
    mutationFn: deleteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      setDeleteTarget(null);
    },
  });

  const records = data ?? [];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {(error as Error).message || '加载失败，请确认后端已启动'}
      </Alert>
    );
  }

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight={700}>
          练习记录
        </Typography>
        <Button
          component={RouterLink}
          to="/records/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          新建记录
        </Button>
      </Stack>

      <Stack direction="row" spacing={2} mb={3} alignItems="center">
        <TextField
          fullWidth
          placeholder="搜索牌阵名、关键牌或解读摘要..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchKeyword && (
              <InputAdornment position="end">
                <Button
                  size="small"
                  onClick={handleClear}
                  disabled={isLoading || isFetching}
                  sx={{ minWidth: 'auto', p: 0.5 }}
                >
                  <ClearIcon fontSize="small" />
                </Button>
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="deck-select-label">牌组筛选</InputLabel>
          <Select
            labelId="deck-select-label"
            value={selectedDeck}
            label="牌组筛选"
            onChange={handleDeckChange}
            disabled={isLoading}
            displayEmpty
          >
            <MenuItem value="">全部牌组</MenuItem>
            {deckOptions.map((deck) => (
              <MenuItem key={deck} value={deck}>
                {deck}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={isFetching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
          onClick={handleSearch}
          disabled={isLoading || isFetching}
          sx={{ minWidth: 100 }}
        >
          {isFetching ? '搜索中...' : '搜索'}
        </Button>
      </Stack>

      {isFetching && records.length > 0 && (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {records.length === 0 ? (
        <Alert severity="info">
          {submittedKeyword || selectedDeck
            ? `未找到${
                selectedDeck ? `牌组「${selectedDeck}」中` : ''
              }${submittedKeyword ? `包含「${submittedKeyword}」的` : '符合条件的'}记录，请尝试其他条件。`
            : '暂无记录，点击「新建记录」开始练习吧。'}
        </Alert>
      ) : (
        <Stack spacing={2} sx={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          {records.map((record) => (
            <Card key={record.id} variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={1}
                >
                  <Typography
                    variant="h6"
                    component={RouterLink}
                    to={`/records/${record.id}`}
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'underline',
                      '&:hover': { color: 'primary.dark' },
                    }}
                  >
                    {record.spread_name}
                  </Typography>
                  <Chip
                    label={formatDate(record.date)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  牌组：{record.deck}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  关键牌：{record.key_cards}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1.5 }}>
                  {record.summary}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  component={RouterLink}
                  to={`/records/${record.id}/edit`}
                  size="small"
                  startIcon={<EditOutlinedIcon />}
                >
                  编辑
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => setDeleteTarget(record)}
                >
                  删除
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定删除「{deleteTarget?.spread_name}」（
            {deleteTarget ? formatDate(deleteTarget.date) : ''}）吗？此操作不可撤销。
          </DialogContentText>
          {deleteMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(deleteMutation.error as Error).message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>取消</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
          >
            {deleteMutation.isPending ? '删除中…' : '删除'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
