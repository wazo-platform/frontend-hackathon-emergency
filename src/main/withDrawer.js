import React from 'react';
import {connect} from 'react-redux';
import styled from 'styled-components';
import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/Menu';
import Badge from '@material-ui/core/Badge';
import NotificationsIcon from '@material-ui/icons/Notifications';
import IconButton from '@material-ui/core/IconButton/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Divider from '@material-ui/core/Divider/Divider';
import List from '@material-ui/core/List/List';
import ListItem from '@material-ui/core/ListItem/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import Typography from '@material-ui/core/Typography';
import DashboardIcon from '@material-ui/icons/Dashboard';
import CancelIcon from '@material-ui/icons/Cancel';

import { logout } from '../user/userActions';

const drawerWidth = 240;

const Container = styled.div`
  display: flex;
`;
const StyledAppBar = styled(AppBar)`
  z-index: ${({ theme }) => theme.zIndex.drawer + 1}!important;
  transition: ${({ theme, open }) =>
    theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen
    })};
  margin-left: ${({ open }) => (open ? drawerWidth : 0)}px !important;
  width: calc(100% - ${({ open }) => (open ? drawerWidth : 0)}px) !important;
`;
const StyledToolbar = styled(Toolbar)`
  padding-right: 24px;
`;
const ToggleDrawer = styled(IconButton)`
  margin-left: 12px !important;
  margin-right: 36px !important;
  display: ${({ open }) => (!open ? 'block' : 'none')}!important;
`;
const Title = styled(Typography)`
  flex-grow: 1;
`;
const StyledDrawer = styled(Drawer)`
  .paper {
    z-index: ${({ theme }) => theme.zIndex.drawer};
    position: relative;
    white-space: nowrap;
    transition: ${({ theme, open }) =>
      theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen
      })};
    overflow-x: ${({ open }) => (!open ? 'hidden' : 'inherit')};
    width: ${({ theme, open }) => (!open ? theme.spacing.unit * 9 : drawerWidth)}px;
`;
const CloseDrawerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 8px;
  ${({ theme }) => theme.mixins.toolbar};
`;
const Content = styled.div`
  flex-grow: 1;
  padding: ${({ theme }) => theme.spacing.unit * 3}px;
  padding-top: ${({ theme }) => theme.spacing.unit * 10}px;
  height: 100vh;
  overflow: auto;
`;

export default title => Component => {
  class WithDrawer extends React.Component {
    static async getInitialProps(ctx) {
      return Component.getInitialProps ? Component.getInitialProps(ctx) : {};
    }

    constructor(props) {
      super(props);

      this.state = {
        drawerOpened: false
      };
    }

    toggleDrawer = open => () => {
      this.setState({
        drawerOpened: open
      });
    };

    render() {
      const { drawerOpened } = this.state;

      return (
        <Container>
          <StyledAppBar position="absolute" open={drawerOpened}>
            <StyledToolbar disableGutters={!drawerOpened}>
              <ToggleDrawer
                color="inherit"
                aria-label="Open drawer"
                open={drawerOpened}
                onClick={this.toggleDrawer(true)}
              >
                <MenuIcon />
              </ToggleDrawer>

              <Title component="h1" variant="h6" color="inherit" noWrap>
                {title}
              </Title>

              <IconButton color="inherit">
                <Badge badgeContent={2} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </StyledToolbar>
          </StyledAppBar>

          <StyledDrawer variant="permanent" classes={{ paper: 'paper' }} open={drawerOpened}>
            <CloseDrawerContainer>
              <IconButton onClick={this.toggleDrawer(false)}>
                <ChevronLeftIcon />
              </IconButton>
            </CloseDrawerContainer>

            <Divider />
            <List>
              <ListItem button>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  this.props.logout(logout());
                }}
              >
                <ListItemIcon>
                  <CancelIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          </StyledDrawer>

          <Content>
            <Component {...this.props} />
          </Content>
        </Container>
      );
    }
  }

  return connect(() => ({}), { logout })(WithDrawer);
};
