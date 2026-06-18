import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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
  Stack,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';
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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['records'],
    queryFn: fetchRecords,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      setDeleteTarget(null);
    },
  });

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

  const records = data ?? [];

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

      {records.length === 0 ? (
        <Alert severity="info">暂无记录，点击「新建记录」开始练习吧。</Alert>
      ) : (
        <Stack spacing={2}>
          {records.map((record) => (
            <Card key={record.id} variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={1}
                >
                  <Typography variant="h6" component="h2">
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
