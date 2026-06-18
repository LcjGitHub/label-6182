import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Drawer,
  Grid2 as Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { fetchCalendarMonth, fetchRecordsByDate } from '../api';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function getCalendarGrid(year: number, month: number): (number | null)[] {
  const firstDay = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
  const daysInMonth = firstDay.daysInMonth();
  let startDow: number = firstDay.day();
  startDow = startDow === 0 ? 6 : startDow - 1;
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const remainder = cells.length % 7;
  if (remainder > 0) {
    for (let i = 0; i < 7 - remainder; i++) cells.push(null);
  }
  return cells;
}

export default function CalendarPage() {
  const today = dayjs();
  const [year, setYear] = useState(today.year());
  const [month, setMonth] = useState(today.month() + 1);
  const [drawerDate, setDrawerDate] = useState<string | null>(null);

  const calendarQuery = useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () => fetchCalendarMonth(year, month),
  });

  const dateCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (calendarQuery.data?.dates) {
      for (const item of calendarQuery.data.dates) {
        map[item.date] = item.count;
      }
    }
    return map;
  }, [calendarQuery.data]);

  const drawerQuery = useQuery({
    queryKey: ['records-by-date', drawerDate],
    queryFn: () => fetchRecordsByDate(drawerDate!),
    enabled: drawerDate !== null,
  });

  const cells = useMemo(() => getCalendarGrid(year, month), [year, month]);

  const goPrev = useCallback(() => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const goNext = useCallback(() => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  const goToday = useCallback(() => {
    const now = dayjs();
    setYear(now.year());
    setMonth(now.month() + 1);
  }, []);

  const handleCellClick = useCallback(
    (day: number) => {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setDrawerDate(dateStr);
    },
    [year, month],
  );

  const isToday = useCallback(
    (day: number) => {
      return today.year() === year && today.month() + 1 === month && today.date() === day;
    },
    [today, year, month],
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={700}>
          练习日历
        </Typography>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <IconButton onClick={goPrev} aria-label="上一月">
              <ChevronLeftIcon />
            </IconButton>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <CalendarMonthIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                {year}年{month}月
              </Typography>
              <Typography
                component="button"
                variant="body2"
                onClick={goToday}
                sx={{
                  border: '1px solid',
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  px: 1,
                  py: 0.2,
                  color: 'primary.main',
                  background: 'transparent',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' },
                }}
              >
                今天
              </Typography>
            </Stack>
            <IconButton onClick={goNext} aria-label="下一月">
              <ChevronRightIcon />
            </IconButton>
          </Stack>

          <Grid container spacing={0}>
            {WEEKDAYS.map((wd) => (
              <Grid key={wd} size={1.714}>
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 1,
                    fontWeight: 600,
                    color: 'text.secondary',
                    fontSize: '0.85rem',
                  }}
                >
                  {wd}
                </Box>
              </Grid>
            ))}
          </Grid>

          {calendarQuery.isLoading ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={8} gap={2}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                正在加载日历数据…
              </Typography>
            </Box>
          ) : calendarQuery.isError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(calendarQuery.error as Error).message || '加载日历数据失败'}
            </Alert>
          ) : (
            <Grid container spacing={0}>
              {cells.map((day, idx) => {
                if (day === null) {
                  return (
                    <Grid key={`empty-${idx}`} size={1.714}>
                      <Box sx={{ height: 72 }} />
                    </Grid>
                  );
                }

                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const count = dateCountMap[dateStr] ?? 0;
                const todayFlag = isToday(day);

                return (
                  <Grid key={day} size={1.714}>
                    <Box
                      onClick={() => handleCellClick(day)}
                      sx={{
                        height: 72,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: todayFlag ? '2px solid' : '1px solid',
                        borderColor: todayFlag ? 'primary.main' : 'divider',
                        bgcolor: count > 0 ? 'primary.100' : 'transparent',
                        transition: 'background-color 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          bgcolor: count > 0 ? 'primary.200' : 'action.hover',
                          boxShadow: 1,
                        },
                        position: 'relative',
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={todayFlag ? 700 : 400}
                        color={todayFlag ? 'primary.main' : 'text.primary'}
                      >
                        {day}
                      </Typography>
                      {count > 0 && (
                        <Box
                          sx={{
                            mt: 0.3,
                            minWidth: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            px: 0.5,
                          }}
                        >
                          {count}
                        </Box>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </CardContent>
      </Card>

      <Drawer
        anchor="right"
        open={drawerDate !== null}
        onClose={() => setDrawerDate(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, p: 3 } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            {drawerDate
              ? dayjs(drawerDate).format('YYYY年M月D日')
              : ''}{' '}
            练习记录
          </Typography>
          <IconButton onClick={() => setDrawerDate(null)} aria-label="关闭">
            <CloseIcon />
          </IconButton>
        </Stack>

        {drawerQuery.isLoading ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={8} gap={2}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              正在加载当日记录…
            </Typography>
          </Box>
        ) : drawerQuery.isError ? (
          <Alert severity="error">
            {(drawerQuery.error as Error).message || '加载记录失败'}
          </Alert>
        ) : !drawerQuery.data || drawerQuery.data.length === 0 ? (
          <Typography variant="body2" color="text.secondary" py={4} textAlign="center">
            当天暂无练习记录
          </Typography>
        ) : (
          <Stack spacing={2}>
            {drawerQuery.data.map((record) => (
              <Card key={record.id} variant="outlined">
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    component={RouterLink}
                    to={`/records/${record.id}`}
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {record.spread_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    牌组：{record.deck}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    关键牌：{record.key_cards}
                  </Typography>
                  <Typography variant="body2" mt={1} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {record.summary}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Drawer>
    </Stack>
  );
}
