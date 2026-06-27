import { useState } from 'react';
import type { LoginPayload } from '../auth/types';

interface LoginScreenProps {
  onSubmit?: (payload: LoginPayload) => void;
  isLoading?: boolean;
  errorMessage?: string;
}

export function LoginScreen({ onSubmit, isLoading, errorMessage }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.({ email, password });
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {errorMessage ? <p>{errorMessage}</p> : null}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
