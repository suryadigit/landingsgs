import React from 'react';
import { Modal, Button, Group, Stack, Text, Box } from '@mantine/core';

interface Props {
  opened: boolean;
  onClose: () => void;
  invoiceUrl?: string;
  amount?: number | string;
  blank?: boolean;
}

export const XenditInvoiceModal: React.FC<Props> = ({ opened, onClose, invoiceUrl, blank }) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Pembayaran"
      size={420}
      centered
      closeOnClickOutside={false}
      styles={{
        content: { borderRadius: 8, padding: 12 },
        title: { fontSize: 16, fontWeight: 700 },
        header: { paddingBottom: 6 },
        body: { padding: 8 },
      }}
    >
      <Stack gap="sm" style={{ padding: 6 }}>
        

        <Box style={{ width: '100%', height: '65vh', maxWidth: 420, borderRadius: 8, overflow: 'hidden', margin: '0 auto' }}>
          {blank ? (
            <iframe
              src="about:blank"
              title="Blank"
              style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
            />
          ) : invoiceUrl ? (
            <iframe
              src={invoiceUrl}
              title="Xendit Invoice"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <Box style={{ padding: 24 }}>
              <Text size="sm">Tautan invoice belum tersedia. Coba lagi nanti.</Text>
            </Box>
          )}
        </Box>

        <Group justify="space-between">
          <Button variant="default" onClick={onClose} size="sm">Tutup</Button>
          <Group>
            {invoiceUrl && !blank && (
              <Button component="a" href={invoiceUrl} target="_blank" rel="noreferrer" size="sm">Buka di Tab Baru</Button>
            )}
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};

export default XenditInvoiceModal;
