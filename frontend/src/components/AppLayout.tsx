import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import BarChartIcon from '@mui/icons-material/BarChart';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';

/** 全局页面布局 */
export default function AppLayout() {
  const location = useLocation();
  const isStatsActive = location.pathname === '/stats';
  const isRecordsActive = !isStatsActive;

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
