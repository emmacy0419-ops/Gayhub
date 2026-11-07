export const metadata = {
  title: 'GayHub',
  description: 'Find your match',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
