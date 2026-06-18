import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { fetchRecord } from '../api';

/**
 * 格式化展示日期
 * @param date - ISO 日期字符串
 */
function formatDate(date: string): string {
  return dayjs(date).format('YYYY年M月D日');
}

/**
 * 格式化展示时间
 * @param datetime - ISO 日期时间字符串
 */
function formatDateTime(datetime: string): string {
  return dayjs(datetime).format('YYYY年M月D日 HH:mm:ss');
}

/** 练习记录详情页 */
export default function RecordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const recordId = Number(id);

  const {
    data: record,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['record', recordId],
    queryFn: () => fetchRecord(recordId),
    enabled: !Number.isNaN(recordId),
  });

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" py={8} gap={2}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          正在加载记录详情…
        </Typography>
      </Box>
    );
  }

  if (isError || !record) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          {(error as Error)?.message || '记录不存在或加载失败'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          返回列表
        </Button>
      </Stack>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 2 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {record.spread_name}
      </Typography>

      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            日期
          </Typography>
          <Typography variant="body1">{formatDate(record.date)}</Typography>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            牌组
          </Typography>
          <Typography variant="body1">{record.deck}</Typography>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            关键牌
          </Typography>
          <Typography variant="body1">{record.key_cards}</Typography>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            解读摘要
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {record.summary}
          </Typography>
        </Box>

        <Divider />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 4 }}
          sx={{ color: 'text.secondary' }}
        >
          <Typography variant="body2">
            创建时间：{formatDateTime(record.created_at)}
          </Typography>
          <Typography variant="body2">
            更新时间：{formatDateTime(record.updated_at)}
          </Typography>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        mt={4}
        pt={2}
        borderTop={1}
        borderColor="divider"
      >
        <Button
          component={RouterLink}
          to={`/records/${record.id}/edit`}
          variant="contained"
          startIcon={<EditOutlinedIcon />}
        >
          编辑
        </Button>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          返回列表
        </Button>
      </Stack>
    </Paper>
  );
}
