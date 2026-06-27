import { useState } from 'react';
import type { RegisterPayload } from '../src/auth/types';

interface RegisterScreenProps {
  onSubmit?: (payload: RegisterPayload) => void;
  isLoading?: boolean;
  errorMessage?: string;
}

export function RegisterScreen({ onSubmit, isLoading, errorMessage }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.({ name, email, password });
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
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
          {isLoading ? 'Registering…' : 'Register'}
        </button>
      </form>
    </div>
  );
}
