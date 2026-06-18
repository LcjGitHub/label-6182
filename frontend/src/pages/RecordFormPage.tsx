import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createRecord, fetchRecord, fetchRecords, updateRecord } from '../api';
import RecordForm from '../components/RecordForm';
import type { PracticeRecordInput } from '../types';

/** 新建/编辑练习记录页 */
export default function RecordFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);
  const recordId = Number(id);
  const [copiedValues, setCopiedValues] = useState<PracticeRecordInput | undefined>();
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const {
    data: record,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['record', recordId],
    queryFn: () => fetchRecord(recordId),
    enabled: isEdit && !Number.isNaN(recordId),
  });

  const {
    data: latestRecords,
    isLoading: recordsLoading,
    isError: recordsError,
    error: recordsErrorObj,
  } = useQuery({
    queryKey: ['records', '', ''],
    queryFn: () => fetchRecords('', ''),
    enabled: !isEdit,
    staleTime: 60_000,
  });

  const latestRecord = latestRecords?.[0];

  const saveMutation = useMutation({
    mutationFn: (values: PracticeRecordInput) =>
      isEdit ? updateRecord(recordId, values) : createRecord(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['record', recordId] });
      }
      navigate('/');
    },
  });

  const handleCopyLast = () => {
    if (!latestRecord) return;
    setCopiedValues({
      date: dayjs().format('YYYY-MM-DD'),
      spread_name: latestRecord.spread_name,
      deck: latestRecord.deck,
      key_cards: latestRecord.key_cards,
      summary: '',
    });
    setShowCopySuccess(true);
  };

  useEffect(() => {
    if (showCopySuccess) {
      const timer = setTimeout(() => setShowCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showCopySuccess]);

  if (isEdit && isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (isEdit && isError) {
    return <Alert severity="error">{(error as Error).message}</Alert>;
  }

  const initialValues: PracticeRecordInput | undefined = record
    ? {
        date: record.date,
        spread_name: record.spread_name,
        deck: record.deck,
        key_cards: record.key_cards,
        summary: record.summary,
      }
    : copiedValues;

  return (
    <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 2 }}>
      {!isEdit && recordsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {(recordsErrorObj as Error).message || '加载历史记录失败'}
        </Alert>
      )}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        spacing={2}
      >
        <Typography variant="h5" fontWeight={700}>
          {isEdit ? '编辑记录' : '新建记录'}
        </Typography>
        {!isEdit && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            {recordsLoading && (
              <Typography variant="body2" color="text.secondary">
                正在加载历史记录…
              </Typography>
            )}
            {showCopySuccess && (
              <Typography variant="body2" color="success.main">
                已复制上一条
              </Typography>
            )}
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLast}
              disabled={!latestRecord || recordsLoading}
            >
              复制上一条
            </Button>
          </Stack>
        )}
      </Stack>
      <RecordForm
        initialValues={initialValues}
        submitting={saveMutation.isPending}
        errorMessage={
          saveMutation.isError ? (saveMutation.error as Error).message : null
        }
        onSubmit={(values) => saveMutation.mutate(values)}
        onCancel={() => navigate('/')}
      />
    </Paper>
  );
}
