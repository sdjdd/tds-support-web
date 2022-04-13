import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';

import { Button } from '@/components/antd';
import { client } from '@/http';
import { useCurrentUserState } from '@/App/states';
import { UserSchema } from '@/api/user';

interface LoginFormData {
  username: string;
  password: string;
}

export default function Login() {
  const { register, handleSubmit } = useForm<LoginFormData>();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useCurrentUserState();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    try {
      const res = await client.post<{ user: UserSchema }>('/api/v1/users/login', data);
      setCurrentUser(res.data.user);
      client.defaults.auth = {
        username: data.username,
        password: data.password,
      };
      navigate('/');
    } catch (error) {
      setErrorMessage((error as Error).message);
      setLoading(false);
    }
  });

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-full">
      <div className="w-64 m-auto">
        <form onSubmit={onSubmit}>
          <div className="flex flex-col">
            <label>Username</label>
            <input
              className="px-2 py-1 border border-primary rounded outline-none focus:ring-1 ring-primary"
              {...register('username', { required: true })}
              autoFocus
            />
          </div>

          <div className="flex flex-col mt-2">
            <label>Password</label>
            <input
              className="px-2 py-1 border border-primary rounded outline-none focus:ring-1 ring-primary"
              type="password"
              {...register('password', { required: true })}
            />
          </div>

          <Button className="w-full mt-4" type="primary" htmlType="submit" loading={loading}>
            Sign in
          </Button>
        </form>

        {errorMessage && <p className="w-full mt-2 text-red-500 overflow-hidden">{errorMessage}</p>}
      </div>
    </div>
  );
}
