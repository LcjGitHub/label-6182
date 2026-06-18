import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
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
  createDeckPreset,
  deleteDeckPreset,
  fetchDeckPresets,
  updateDeckPreset,
} from '../api';
import type { DeckPreset, DeckPresetInput } from '../types';

const emptyValues: DeckPresetInput = {
  name: '',
  description: '',
};

/** 牌组预设管理页 */
export default function DeckPresetPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<DeckPreset | null>(null);
  const [formValues, setFormValues] = useState<DeckPresetInput>(emptyValues);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeckPreset | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['deckPresets'],
    queryFn: fetchDeckPresets,
  });

  const saveMutation = useMutation({
    mutationFn: (input: { id?: number; data: DeckPresetInput }) =>
      input.id
        ? updateDeckPreset(input.id, input.data)
        : createDeckPreset(input.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deckPresets'] });
      setDialogOpen(false);
      setEditingPreset(null);
      setFormValues(emptyValues);
      setFormError(null);
    },
    onError: (err) => {
      setFormError((err as Error).message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDeckPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deckPresets'] });
      setDeleteTarget(null);
    },
  });

  useEffect(() => {
    if (editingPreset) {
      setFormValues({
        name: editingPreset.name,
        description: editingPreset.description,
      });
    } else {
      setFormValues(emptyValues);
    }
    setFormError(null);
  }, [editingPreset, dialogOpen]);

  const handleOpenCreate = () => {
    setEditingPreset(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (preset: DeckPreset) => {
    setEditingPreset(preset);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPreset(null);
    setFormValues(emptyValues);
    setFormError(null);
  };

  const handleChange =
    (field: keyof DeckPresetInput) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!formValues.name.trim()) {
      setFormError('名称不能为空');
      return;
    }
    saveMutation.mutate({
      id: editingPreset?.id,
      data: {
        name: formValues.name.trim(),
        description: formValues.description.trim(),
      },
    });
  };

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

  const presets = data ?? [];

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight={700}>
          牌组预设管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          新建预设
        </Button>
      </Stack>

      {presets.length === 0 ? (
        <Alert severity="info">暂无牌组预设，点击「新建预设」开始添加。</Alert>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: '20%' }}>
                    名称
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>简介</TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, width: '160px', textAlign: 'right' }}
                  >
                    操作
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {presets.map((preset) => (
                  <TableRow key={preset.id} hover>
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <Typography variant="body1" fontWeight={600}>
                        {preset.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                      >
                        {preset.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          startIcon={<EditOutlinedIcon />}
                          onClick={() => handleOpenEdit(preset)}
                        >
                          编辑
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => setDeleteTarget(preset)}
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
            {editingPreset ? '编辑牌组预设' : '新建牌组预设'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {formError && <Alert severity="error">{formError}</Alert>}
              <TextField
                label="名称"
                value={formValues.name}
                onChange={handleChange('name')}
                required
                fullWidth
                autoFocus
              />
              <TextField
                label="简介"
                value={formValues.description}
                onChange={handleChange('description')}
                fullWidth
                multiline
                minRows={4}
                placeholder="请输入牌组简介（可选）"
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

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定删除牌组预设「{deleteTarget?.name}」吗？此操作不可撤销。
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
