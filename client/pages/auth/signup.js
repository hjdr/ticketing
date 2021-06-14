import { useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

export default () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { doRequest, errors } = useRequest({
    body: { email, password },
    method: 'post',
    onSuccess: () => Router.push('/'),
    url: '/api/users/signup',
  })
  const onSubmit = async (event) => {
    event.preventDefault();
    await doRequest();
  }
  return (
    <form onSubmit={onSubmit}>
      <h1>Sign Up</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          className="form-control"
          onChange={e => setEmail(e.target.value)}
          value={email}/>
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          className="form-control"
          onChange={e => setPassword(e.target.value)}
          type="password"
          value={password}
        />
      </div>
      {errors}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  );
}
