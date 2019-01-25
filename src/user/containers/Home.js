import React from 'react';
import { connect } from 'react-redux';
import getConfig from 'next/config';
import { bindActionCreators, compose } from 'redux';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import red from '@material-ui/core/colors/red';
import Collapse from '@material-ui/core/Collapse';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import styled from 'styled-components';
import Highlighter from 'react-highlight-words';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { withAuth } from '../../main/auth';
import withDrawer from '../../main/withDrawer';
import { getUserCookies } from '../../main/utils';
import PhoneAPI from '../../phone/services/PhoneAPI';
import { authenticate } from '../userActions';
import { CALLS_FETCHED, fetchAllCalls, pick, cancelCall } from '../../phone/phoneActions';

const {
  publicRuntimeConfig: { keywords }
} = getConfig();

const Container = styled.div`
  margin: ${({ theme }) => theme.spacing.unit * 3}px auto;
`;
const TableContainer = styled(Paper)`
  width: 100%;
  overflow-x: auto;
`;
const StyledTable = styled(Table)`
  min-width: 700px;
`;
const StyledRow = styled(TableRow)`
  background-color: ${({ priority }) => (priority ? red[priority * 100] : 'none')};
  display: ${({ expanded }) => (!!expanded ? 'inline-row' : 'none')}!important;
`;
const ExpandButton = styled(IconButton)`
  transform: rotate(${({ expanded }) => (expanded ? 180 : 0)}deg);
  margin-left: auto;
  transition: ${({ theme }) =>
    theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })};
`;

class Home extends React.Component {
  static async getInitialProps(ctx) {
    const userCookies = getUserCookies(ctx.req);
    const token = userCookies.apiSession && userCookies.apiSession.token;

    if (token) {
      const calls = await PhoneAPI.fetchActiveCalls(token);
      ctx.store.dispatch({ type: CALLS_FETCHED, calls: calls.items });
    }
  }

  constructor(args) {
    super(args);

    this.state = {
      expanded: {}
    };
  }

  componentWillMount() {
    const { apiSession, actions } = this.props;

    apiSession && actions.fetchAllCalls(apiSession.token);
  }

  componentDidMount() {
    const { authenticated, session } = this.props;
    if (!authenticated && session) {
      this.props.actions.authenticate(session.token);
    }
  }

  pick = call => {
    this.props.actions.pick(call);
  };

  close = call => {
    this.props.actions.cancelCall(call);
  };

  reject = session => {
    this.props.rtcClient.hangup(session);
  };

  hold = session => {
    const { apiSession, rtcClient, actions } = this.props;
    rtcClient.hold(session);

    apiSession && actions.fetchAllCalls(apiSession.token);
  };

  unhold = session => {
    const { apiSession, rtcClient, actions } = this.props;
    rtcClient.unhold(session);

    apiSession && actions.fetchAllCalls(apiSession.token);
  };

  accept = callSession => {
    const { session, rtcClient, actions } = this.props;

    rtcClient.accept(callSession);
    actions.fetchAllCalls(session.token);
  };

  getHigherKeyword = (text = '') => {
    let maxKeyword = '';
    let maxPriority = 0;

    Object.keys(keywords).forEach(keyword => {
      if (text.toLocaleLowerCase().indexOf(keyword) !== -1 && keywords[keyword] > maxPriority) {
        maxKeyword = keyword;
        maxPriority = keywords[keyword];
      }
    });

    return maxKeyword;
  };

  getPriority = text => keywords[this.getHigherKeyword(text).toLocaleLowerCase()] || 0;

  getOrderedCalls = () =>
    (this.props.calls || []).sort((call1, call2) =>
      this.getPriority(call1.variables.STT) < this.getPriority(call2.variables.STT) ? 1 : -1
    );

  toggleExpand = number => {
    this.setState({ expanded: { ...!this.state.expanded, [number]: !this.state.expanded[number] } });
  };

  render() {
    const { incoming, rtcClient } = this.props;
    const currentSessionNumber = rtcClient && rtcClient.currentSession && rtcClient.getNumber(rtcClient.currentSession);

    return (
      <Container>
        <Typography variant="h4" gutterBottom component="h2">
          Emergency calls - 0644605122
        </Typography>

        <Dialog
          open={!!incoming}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Incoming call from {rtcClient && !!incoming && rtcClient.getNumber(incoming)}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">Do you want to accept it ?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.reject(incoming)} color="primary">
              NO
            </Button>
            <Button onClick={() => this.accept(incoming)} color="primary" autoFocus>
              YES
            </Button>
          </DialogActions>
        </Dialog>

        <TableContainer>
          <StyledTable>
            <TableHead>
              <TableRow>
                <TableCell>Number</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Keyword</TableCell>
                <TableCell align="right">Priority</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.getOrderedCalls().map(call => {
                const number = call.caller_id_number;
                const session = rtcClient && rtcClient.getSession(number);
                const expanded = !!this.state.expanded[number];

                return (
                  <React.Fragment key={`row-${call.id}`}>
                    <StyledRow key={call.id} priority={this.getPriority(call.variables.STT)} expanded={1}>
                      <TableCell component="th" scope="row">
                        {number}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {call.caller_id_name}
                      </TableCell>
                      <TableCell align="right">{this.getHigherKeyword(call.variables.STT)}</TableCell>
                      <TableCell align="right">{this.getPriority(call.variables.STT)}</TableCell>
                      <TableCell align="right">
                        {!call.isPicked && currentSessionNumber !== number && (
                          <Button onClick={() => this.pick(call)} color="primary">
                            Pick
                          </Button>
                        )}
                        {call.isPicked &&
                          (session && session.local_hold ? (
                            <Button onClick={() => this.unhold(call)} color="primary">
                              Unhold
                            </Button>
                          ) : (
                            <Button onClick={() => this.hold(call)} color="primary">
                              Hold
                            </Button>
                          ))}
                        <Button onClick={() => this.close(call)} color="primary">
                          Close
                        </Button>
                        <ExpandButton expanded={expanded ? 1 : 0} onClick={() => this.toggleExpand(number)}>
                          <ExpandMoreIcon />
                        </ExpandButton>
                      </TableCell>
                    </StyledRow>
                    <StyledRow key={`transcript-${call.id}`} expanded={expanded ? 1 : 0}>
                      <TableCell align="left" colSpan={5}>
                        <Collapse in={this.state.expanded[number]} timeout="auto" unmountOnExit>
                          <Highlighter searchWords={Object.keys(keywords)} textToHighlight={call.variables.STT || ''} />
                        </Collapse>
                      </TableCell>
                    </StyledRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </StyledTable>
        </TableContainer>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  session: state.user.session,
  apiSession: state.user.apiSession,
  authenticated: state.user.authenticated,
  incoming: state.phone.incoming,
  calls: state.phone.calls,
  rtcClient: state.phone.rtcClient,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      authenticate,
      fetchAllCalls,
      pick,
      cancelCall
    },
    dispatch
  )
});

export default compose(
  withAuth,
  withDrawer('Dashboard'),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Home);
