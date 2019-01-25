import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import styled from 'styled-components';
import Avatar from '@material-ui/core/Avatar';
import Paper from '@material-ui/core/Paper';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import { login } from '../userActions';
import { withoutAuth } from '../../main/auth';
import withDrawer from '../../main/withDrawer';

const Container = styled.div`
  width: ${({ theme }) => theme.spacing.unit * 100}px;
  margin: ${({ theme }) => theme.spacing.unit * 30}px auto;
  display: block;
`;
const StyledPaper = styled(Paper)`
  margin-top: ${props => props.theme.spacing.unit * 8}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.unit * 3}px ${({ theme }) => theme.spacing.unit * 2}px;
`;
const StyledAvatar = styled(Avatar)`
  margin: ${props => props.theme.spacing.unit * 8}px;
  background-color: ${props => props.theme.palette.secondary.main} !important;
`;
const Form = styled.form`
  width: 100%;
  margin-top: ${props => props.theme.spacing.unit}px;
`;
const Submit = styled(Button)`
  margin-top: ${props => props.theme.spacing.unit * 3}px !important;
`;
const StyledProgress = styled(CircularProgress)`
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -12px;
`;
const SubmitWrapper = styled.div`
  position: relative;
`;

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: ''
    };
  }

  submit = e => {
    e.preventDefault();

    const { username, password } = this.state;

    this.props.actions.login(username, password);
  };

  render() {
    const { username, password } = this.state;
    const { authenticating } = this.props;

    return (
      <Container>
        <StyledPaper>
          <StyledAvatar>
            <LockOutlinedIcon />
          </StyledAvatar>

          <Typography component="h1" variant="h5">
            Sign in
          </Typography>

          <Form onSubmit={this.submit}>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="email">Email Address</InputLabel>
              <Input
                id="email"
                name="email"
                autoComplete="email"
                autoFocus
                value={username}
                onChange={e => this.setState({ username: e.target.value })}
              />
            </FormControl>

            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="password">Password</InputLabel>
              <Input
                name="password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={e => this.setState({ password: e.target.value })}
              />
            </FormControl>

            <SubmitWrapper>
              <Submit type="submit" fullWidth disabled={authenticating} variant="contained" color="primary">
                Sign in
              </Submit>
              {authenticating && <StyledProgress size={24} />}
            </SubmitWrapper>
          </Form>
        </StyledPaper>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  authenticated: state.user.authenticated,
  authenticating: state.user.authenticating
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      login
    },
    dispatch
  )
});

export default compose(
  withoutAuth,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(Login);
