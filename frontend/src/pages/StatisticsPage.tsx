import BarChartIcon from '@mui/icons-material/BarChart';
import CasinoIcon from '@mui/icons-material/Casino';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchStats } from '../api';
import type { StatsData } from '../types';

/**
 * 格式化月份展示
 * @param month - YYYY-MM 格式
 */
function formatMonth(month: string): string {
  const [year, m] = month.split('-');
  return `${year}年${Number(m)}月`;
}

/**
 * 简单柱状图组件
 */
function BarChart<T extends object>({
  data,
  getLabel,
  getValue,
  color,
}: {
  data: T[];
  getLabel: (item: T) => string;
  getValue: (item: T) => number;
  color: string;
}) {
  if (data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        暂无数据
      </Typography>
    );
  }

  const maxValue = Math.max(...data.map(getValue), 1);

  return (
    <Stack spacing={1.5}>
      {data.map((item, idx) => {
        const label = getLabel(item);
        const value = getValue(item);
        const width = `${(value / maxValue) * 100}%`;
        return (
          <Box key={idx}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={0.5}
            >
              <Typography variant="body2" fontWeight={500}>
                {label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {value} 次
              </Typography>
            </Stack>
            <Box
              sx={{
                width: '100%',
                height: 14,
                bgcolor: 'grey.100',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width,
                  bgcolor: color,
                  borderRadius: 1,
                  transition: 'width 0.4s ease',
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

/** 统计概览卡片 */
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: color,
              color: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

/** 练习统计页 */
export default function StatisticsPage() {
  const { data, isLoading, isError, error } = useQuery<StatsData>({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" py={8} gap={2}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          正在加载统计数据…
        </Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {(error as Error).message || '加载统计数据失败，请确认后端已启动'}
      </Alert>
    );
  }

  const stats = data!;
  const totalRecords = stats.monthly.reduce((sum, m) => sum + m.count, 0);

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700}>
        练习统计
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Box flex={1}>
          <StatCard
            title="累计练习次数"
            value={totalRecords}
            icon={<AutoAwesomeIcon />}
            color="#5e35b1"
          />
        </Box>
        <Box flex={1}>
          <StatCard
            title="使用牌组数量"
            value={stats.by_deck.length}
            icon={<CasinoIcon />}
            color="#ff6f00"
          />
        </Box>
        <Box flex={1}>
          <StatCard
            title="练习牌阵数量"
            value={stats.by_spread.length}
            icon={<BarChartIcon />}
            color="#2e7d32"
          />
        </Box>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
            <CalendarMonthIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              每月练习次数
            </Typography>
          </Stack>
          <BarChart
            data={stats.monthly}
            getLabel={(item) => formatMonth(item.month)}
            getValue={(item) => item.count}
            color="#5e35b1"
          />
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
            <CasinoIcon sx={{ color: '#ff6f00' }} />
            <Typography variant="h6" fontWeight={600}>
              各牌组使用次数
            </Typography>
          </Stack>
          <BarChart
            data={stats.by_deck}
            getLabel={(item) => item.name}
            getValue={(item) => item.count}
            color="#ff6f00"
          />
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
            <BarChartIcon sx={{ color: '#2e7d32' }} />
            <Typography variant="h6" fontWeight={600}>
              各牌阵使用次数
            </Typography>
          </Stack>
          <BarChart
            data={stats.by_spread}
            getLabel={(item) => item.name}
            getValue={(item) => item.count}
            color="#2e7d32"
          />
        </CardContent>
      </Card>
    </Stack>
  );
}
