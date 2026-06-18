import './globals.css';
export const metadata = { title: 'MediStock BD', description: 'Medicine Shop Management' };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
