import { searchService } from '@/services/searchService'
import { useQuery } from '@tanstack/react-query'

export const useSearch = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchService.search(query),
    enabled: query.trim().length >= 2, // Solo buscar si hay al menos 2 caracteres
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}