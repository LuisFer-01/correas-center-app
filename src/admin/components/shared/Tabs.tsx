import {
    Tabs as ShadcnTabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  count?: number
  disabled?: boolean
}

interface TabsProps {
  defaultValue: string
  tabs: TabItem[]
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'underline' | 'pills'
}

export function Tabs({
  defaultValue,
  tabs,
  children,
  className,
  variant = 'default',
}: TabsProps) {
  return (
    <ShadcnTabs defaultValue={defaultValue} className={className}>
      <TabsList
        className={cn(
          'w-full bg-white dark:bg-gradient-to-r dark:from-[#727272] dark:to-[#333333] border border-gray-200 dark:border-gray-600',
          variant === 'default' && 'h-auto p-1 gap-1',
          variant === 'underline' && 'h-auto bg-transparent border-b rounded-none p-0 gap-0',
          variant === 'pills' && 'h-auto p-1 gap-2'
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
            className={cn(
              'flex items-center gap-2 text-sm font-medium transition-all',
              variant === 'default' && 'rounded-md px-4 py-2.5 data-[state=active]:bg-[#EA0A2A] data-[state=active]:text-white data-[state=active]:shadow-sm',
              variant === 'underline' && 'rounded-none border-b-2 border-transparent data-[state=active]:border-[#EA0A2A] data-[state=active]:text-[#EA0A2A] px-4 py-3',
              variant === 'pills' && 'rounded-full px-4 py-2 data-[state=active]:bg-[#EA0A2A] data-[state=active]:text-white',
              'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'ml-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                  'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300',
                  'group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white'
                )}
              >
                {tab.count}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </ShadcnTabs>
  )
}

// Re-exportamos TabsContent para facilitar el uso
export { TabsContent }
