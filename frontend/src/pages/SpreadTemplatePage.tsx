import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  createSpreadTemplate,
  deleteSpreadTemplate,
  fetchSpreadTemplates,
  updateSpreadTemplate,
} from '../api';
import type { SortOption, SpreadTemplate, SpreadTemplateInput } from '../types';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date_desc', label: '日期（新→旧）' },
  { value: 'date_asc', label: '日期（旧→新）' },
  { value: 'name_asc', label: '名称（A→Z）' },
];

const emptyValues: SpreadTemplateInput = {
  name: '',
  scenario: '',
  card_count: 0,
};

/** 牌阵模板管理页 */
export default function SpreadTemplatePage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SpreadTemplate | null>(null);
  const [formValues, setFormValues] = useState<SpreadTemplateInput>(emptyValues);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SpreadTemplate | null>(null);
  const [detailTemplate, setDetailTemplate] = useState<SpreadTemplate | null>(null);
  const [sort, setSort] = useState<SortOption>('date_desc');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['spreadTemplates', sort],
    queryFn: () => fetchSpreadTemplates(sort),
  });

  const saveMutation = useMutation({
    mutationFn: (input: { id?: number; data: SpreadTemplateInput }) =>
      input.id
        ? updateSpreadTemplate(input.id, input.data)
        : createSpreadTemplate(input.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spreadTemplates'] });
      setDialogOpen(false);
      setEditingTemplate(null);
      setFormValues(emptyValues);
      setFormError(null);
    },
    onError: (err) => {
      setFormError((err as Error).message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSpreadTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spreadTemplates'] });
      setDeleteTarget(null);
    },
  });

  useEffect(() => {
    if (editingTemplate) {
      setFormValues({
        name: editingTemplate.name,
        scenario: editingTemplate.scenario,
        card_count: editingTemplate.card_count,
      });
    } else {
      setFormValues(emptyValues);
    }
    setFormError(null);
  }, [editingTemplate, dialogOpen]);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (template: SpreadTemplate) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
    setFormValues(emptyValues);
    setFormError(null);
  };

  const handleChange =
    (field: keyof SpreadTemplateInput) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormValues((prev) => ({
        ...prev,
        [field]: field === 'card_count' ? Number(value) : value,
      }));
    };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!formValues.name.trim()) {
      setFormError('名称不能为空');
      return;
    }
    if (formValues.card_count < 0) {
      setFormError('建议牌位数量不能为负数');
      return;
    }
    saveMutation.mutate({
      id: editingTemplate?.id,
      data: {
        name: formValues.name.trim(),
        scenario: formValues.scenario.trim(),
        card_count: formValues.card_count,
      },
    });
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        py={8}
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          正在加载牌阵模板…
        </Typography>
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

  const templates = data ?? [];

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h5" fontWeight={700}>
            牌阵模板库
          </Typography>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="spread-templates-sort-label">排序方式</InputLabel>
            <Select
              labelId="spread-templates-sort-label"
              value={sort}
              label="排序方式"
              onChange={(e) => setSort(e.target.value as SortOption)}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          新建模板
        </Button>
      </Stack>

      {templates.length === 0 ? (
        <Alert severity="info">暂无牌阵模板，点击「新建模板」开始添加。</Alert>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: '25%' }}>
                    模板名称
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>适用场景</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: '120px' }}>
                    建议牌位
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, width: '200px', textAlign: 'right' }}
                  >
                    操作
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id} hover>
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <Typography variant="body1" fontWeight={600}>
                        {template.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {template.scenario || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <Chip
                        label={`${template.card_count} 张`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          startIcon={<InfoOutlinedIcon />}
                          onClick={() => setDetailTemplate(template)}
                        >
                          详情
                        </Button>
                        <Button
                          size="small"
                          startIcon={<EditOutlinedIcon />}
                          onClick={() => handleOpenEdit(template)}
                        >
                          编辑
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => setDeleteTarget(template)}
                        >
                          删除
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <DialogTitle>
            {editingTemplate ? '编辑牌阵模板' : '新建牌阵模板'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {formError && <Alert severity="error">{formError}</Alert>}
              <TextField
                label="模板名称"
                value={formValues.name}
                onChange={handleChange('name')}
                required
                fullWidth
                autoFocus
              />
              <TextField
                label="适用场景说明"
                value={formValues.scenario}
                onChange={handleChange('scenario')}
                fullWidth
                multiline
                minRows={4}
                placeholder="请输入适用场景说明（可选）"
              />
              <TextField
                label="建议牌位数量"
                type="number"
                value={formValues.card_count}
                onChange={handleChange('card_count')}
                fullWidth
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseDialog} disabled={saveMutation.isPending}>
              取消
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? '保存中…' : '保存'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(detailTemplate)}
        onClose={() => setDetailTemplate(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{detailTemplate?.name}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                建议牌位数量
              </Typography>
              <Chip
                label={`${detailTemplate?.card_count} 张`}
                color="primary"
                variant="outlined"
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                适用场景说明
              </Typography>
              <Typography
                variant="body1"
                sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {detailTemplate?.scenario || '暂无说明'}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailTemplate(null)}>关闭</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定删除牌阵模板「{deleteTarget?.name}」吗？此操作不可撤销。
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
