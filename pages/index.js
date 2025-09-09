import { useEffect, useState } from 'react'

export default function Home() {
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    async function fetchCompanies() {
      const res = await fetch('/api/companies')
      const data = await res.json()
      setCompanies(data)
    }
    fetchCompanies()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Cartão Virtual 5G</h1>
      <h2>Empresas cadastradas</h2>
      <ul>
        {companies.map(c => (
          <li key={c.id}>{c.name} ({c.slug})</li>
        ))}
      </ul>
    </div>
  )
}
