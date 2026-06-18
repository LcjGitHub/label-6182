import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

/** 全局页面布局 */
export default function AppLayout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <AutoStoriesIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="h1" fontWeight={700}>
            塔罗牌阵练习记录
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
