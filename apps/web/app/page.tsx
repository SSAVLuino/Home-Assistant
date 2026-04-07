import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Home Deadlines</h1>

      <Link href="/login">Login</Link>
      <br />
      <Link href="/dashboard">Dashboard</Link>
    </main>
  );
}
