import Link from 'next/link';
export default function Layout({ children }) {
  return (
    <>
      <header className="container header">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{fontWeight:700}}>PulseLocal</div>
          <nav>
            <Link href="/"><a style={{marginRight:12}}>Home</a></Link>
            <Link href="/admin"><a style={{marginRight:12}}>Admin</a></Link>
            <Link href="/company/dashboard"><a>Empresa</a></Link>
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
      <div className="footer-fake" />
    </>
  );
}
