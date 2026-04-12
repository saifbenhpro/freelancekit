import { useState, useCallback } from 'react'
import {
  Autocomplete,
  CircularProgress,
  TextField,
} from '@mui/material'

interface Entreprise {
  siren: string
  siret: string
  nom_complet: string
  siege: {
    siret: string
    adresse: string
    code_postal: string
    commune: string
  }
  dirigeants?: { nom?: string; prenom?: string }[]
}

interface Props {
  onSelect: (data: {
    companyName: string
    siret: string
    address: string
  }) => void
}

function debounce<T extends unknown[]>(fn: (...args: T) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: T) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export default function SiretAutocomplete({ onSelect }: Props) {
  const [options, setOptions] = useState<Entreprise[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const search = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) { setOptions([]); return }
      setLoading(true)
      try {
        const res = await fetch(
          `https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(query)}&page=1&per_page=8`,
        )
        const json = await res.json() as { results: Entreprise[] }
        setOptions(json.results ?? [])
      } catch {
        setOptions([])
      } finally {
        setLoading(false)
      }
    }, 400),
    [],
  )

  return (
    <Autocomplete
      freeSolo
      options={options}
      inputValue={inputValue}
      loading={loading}
      getOptionLabel={(o) => typeof o === 'string' ? o : o.nom_complet}
      onInputChange={(_e, val) => {
        setInputValue(val)
        search(val)
      }}
      onChange={(_e, val) => {
        if (!val || typeof val === 'string') return
        const adresse = [val.siege.adresse, val.siege.code_postal, val.siege.commune]
          .filter(Boolean)
          .join(', ')
        onSelect({
          companyName: val.nom_complet,
          siret: val.siege.siret,
          address: adresse,
        })
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Rechercher une entreprise (nom, SIRET…)"
          fullWidth
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress size={18} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  )
}
