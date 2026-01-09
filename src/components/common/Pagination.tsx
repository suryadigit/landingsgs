import React from 'react'
import { Group, Text, ActionIcon, Select, Box } from '@mantine/core'
import { usePagination } from '@mantine/hooks'
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react'
import { COLORS } from '../../shared/types'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (limit: number) => void
  showItemsPerPage?: boolean
  itemsPerPageOptions?: number[]
  dark?: boolean
  isMobile?: boolean
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [10, 20, 50, 100],
  dark = false,
  isMobile = false,
}) => {
  const pagination = usePagination({
    total: totalPages,
    page: currentPage,
    onChange: onPageChange,
    siblings: 1,
    boundaries: 1,
  })

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const buttonStyle = (isActive: boolean = false, isDisabled: boolean = false) => ({
    width: isMobile ? 32 : 36,
    height: isMobile ? 32 : 36,
    borderRadius: 8,
    backgroundColor: isActive
      ? COLORS.accent.primary
      : dark
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.03)',
    color: isActive
      ? '#000000'
      : isDisabled
      ? dark
        ? '#555555'
        : '#cccccc'
      : dark
      ? '#ffffff'
      : COLORS.text.dark,
    border: `1px solid ${isActive ? COLORS.accent.primary : dark ? 'rgba(255, 255, 255, 0.1)' : COLORS.border}`,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
  })

  if (totalPages <= 1 && !showItemsPerPage) {
    return null
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: 16,
        padding: '16px 0',
      }}
    >
      <Text
        size="sm"
        style={{
          color: dark ? '#a1a1a1' : COLORS.text.tertiary,
          textAlign: isMobile ? 'center' : 'left',
        }}
      >
        Showing {startItem} to {endItem} of {totalItems} results
      </Text>

      <Group gap={8} justify={isMobile ? 'center' : 'flex-end'} wrap="wrap">
        {showItemsPerPage && onItemsPerPageChange && (
          <Group gap={8}>
            <Text size="sm" style={{ color: dark ? '#a1a1a1' : COLORS.text.tertiary }}>
              Per page:
            </Text>
            <Select
              value={String(itemsPerPage)}
              onChange={(val) => val && onItemsPerPageChange(Number(val))}
              data={itemsPerPageOptions.map((opt) => ({ value: String(opt), label: String(opt) }))}
              size="xs"
              w={70}
              styles={{
                input: {
                  backgroundColor: dark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                  border: `1px solid ${dark ? 'rgba(255, 255, 255, 0.1)' : COLORS.border}`,
                  color: dark ? '#ffffff' : COLORS.text.dark,
                },
              }}
            />
          </Group>
        )}

        {totalPages > 1 && (
          <Group gap={4}>
            <ActionIcon
              variant="subtle"
              onClick={() => pagination.first()}
              disabled={currentPage === 1}
              style={buttonStyle(false, currentPage === 1)}
              title="First page"
            >
              <IconChevronsLeft size={16} />
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              onClick={() => pagination.previous()}
              disabled={currentPage === 1}
              style={buttonStyle(false, currentPage === 1)}
              title="Previous page"
            >
              <IconChevronLeft size={16} />
            </ActionIcon>

            {!isMobile &&
              pagination.range.map((page, index) =>
                page === 'dots' ? (
                  <Text
                    key={`dots-${index}`}
                    style={{
                      width: 36,
                      textAlign: 'center',
                      color: dark ? '#a1a1a1' : COLORS.text.tertiary,
                    }}
                  >
                    ...
                  </Text>
                ) : (
                  <ActionIcon
                    key={page}
                    variant="subtle"
                    onClick={() => pagination.setPage(page)}
                    style={buttonStyle(currentPage === page)}
                  >
                    {page}
                  </ActionIcon>
                )
              )}

            {isMobile && (
              <Text
                style={{
                  padding: '0 12px',
                  color: dark ? '#ffffff' : COLORS.text.dark,
                  fontWeight: 600,
                }}
              >
                {currentPage} / {totalPages}
              </Text>
            )}

            <ActionIcon
              variant="subtle"
              onClick={() => pagination.next()}
              disabled={currentPage === totalPages}
              style={buttonStyle(false, currentPage === totalPages)}
              title="Next page"
            >
              <IconChevronRight size={16} />
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              onClick={() => pagination.last()}
              disabled={currentPage === totalPages}
              style={buttonStyle(false, currentPage === totalPages)}
              title="Last page"
            >
              <IconChevronsRight size={16} />
            </ActionIcon>
          </Group>
        )}
      </Group>
    </Box>
  )
}


export default Pagination
