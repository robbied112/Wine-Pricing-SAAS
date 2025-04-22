// pages/success.js
import Link from 'next/link';

export default function Success() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Success!</h1>
      <p>You reached the success page.</p>
      <Link href="/dashboard">
        Go to Dashboard
      </Link>
      <br />
      <Link href="/login">
        Go to Login
      </Link>
    </div>
  );
}