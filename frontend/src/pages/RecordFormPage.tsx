import { Alert, Box, CircularProgress, Paper, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { createRecord, fetchRecord, updateRecord } from '../api';
import RecordForm from '../components/RecordForm';
import type { PracticeRecordInput } from '../types';

/** 新建/编辑练习记录页 */
export default function RecordFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);
  const recordId = Number(id);

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
    : undefined;

  return (
    <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        {isEdit ? '编辑记录' : '新建记录'}
      </Typography>
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
