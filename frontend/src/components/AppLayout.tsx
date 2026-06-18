import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import BarChartIcon from '@mui/icons-material/BarChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StyleIcon from '@mui/icons-material/Style';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';

/** 全局页面布局 */
export default function AppLayout() {
  const location = useLocation();
  const isRecordsActive =
    location.pathname === '/' || location.pathname.startsWith('/records');
  const isCalendarActive = location.pathname === '/calendar';
  const isStatsActive = location.pathname === '/stats';
  const isDecksActive = location.pathname === '/decks';
  const isTemplatesActive = location.pathname === '/templates';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <AutoStoriesIcon sx={{ mr: 1.5 }} />
            <Typography variant="h6" component="h1" fontWeight={700}>
              塔罗牌阵练习记录
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              variant={isRecordsActive ? 'outlined' : 'text'}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
              }}
            >
              练习记录
            </Button>
            <Button
              component={RouterLink}
              to="/calendar"
              color="inherit"
              variant={isCalendarActive ? 'outlined' : 'text'}
              startIcon={<CalendarMonthIcon fontSize="small" />}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
              }}
            >
              练习日历
            </Button>
            <Button
              component={RouterLink}
              to="/templates"
              color="inherit"
              variant={isTemplatesActive ? 'outlined' : 'text'}
              startIcon={<ViewQuiltIcon fontSize="small" />}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
              }}
            >
              牌阵模板
            </Button>
            <Button
              component={RouterLink}
              to="/decks"
              color="inherit"
              variant={isDecksActive ? 'outlined' : 'text'}
              startIcon={<StyleIcon fontSize="small" />}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
              }}
            >
              牌组管理
            </Button>
            <Button
              component={RouterLink}
              to="/stats"
              color="inherit"
              variant={isStatsActive ? 'outlined' : 'text'}
              startIcon={<BarChartIcon fontSize="small" />}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
              }}
            >
              练习统计
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
