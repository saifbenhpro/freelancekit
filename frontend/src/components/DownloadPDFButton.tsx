import { useState } from 'react'
import { Button } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import { pdf } from '@react-pdf/renderer'
import type { Quote } from '@/types'
import QuotePDF from './QuotePDF'

interface Props {
  quote: Quote
}

export default function DownloadPDFButton({ quote }: Props) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    const blob = await pdf(<QuotePDF quote={quote} />).toBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${quote.number}.pdf`
    a.click()
    URL.revokeObjectURL(url)
    setLoading(false)
  }

  return (
    <Button
      variant="outlined"
      startIcon={<DownloadIcon />}
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? 'Génération…' : 'Télécharger PDF'}
    </Button>
  )
}
