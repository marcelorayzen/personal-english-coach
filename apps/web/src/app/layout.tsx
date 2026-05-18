export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          background:
            'linear-gradient(140deg, #f7fbff 0%, #eef6ff 45%, #f6faf4 100%)',
          color: '#0f172a',
          fontFamily: '"Trebuchet MS", "Verdana", "Segoe UI", sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
