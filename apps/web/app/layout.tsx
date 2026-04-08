import type { ReactNode } from 'react';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="it">
      <body
        style={{
          margin: 0,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div
          style={{
            maxWidth: 420,
            margin: '0 auto',
            minHeight: '100vh',
            background: '#fff',
            padding: '16px',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
``
