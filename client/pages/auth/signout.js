import { useEffect } from 'react';
import useRequest from '../../hooks/use-request'
import Router from 'next/router';

export default () => {
  const { doRequest } = useRequest({
    body: {},
    method: 'post',
    onSuccess: () => Router.push('/'),
    url: '/api/users/signout'
  });
  useEffect(() => {
    doRequest();
  }, [])
  return (
    <div>Signing you out...</div>
  )
}
