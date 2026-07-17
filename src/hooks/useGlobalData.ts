import { globalsService } from '@/services/globalsService'
import { useQuery } from '@tanstack/react-query'

export const useGlobalData = () => {
  return useQuery({
    queryKey: ['globals'],
    queryFn: () => globalsService.getGlobalData(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2,
  })
}