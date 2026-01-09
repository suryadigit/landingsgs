import React from 'react';
import { Container, Stack, Grid, Skeleton, Box } from '@mantine/core';

const DashboardSkeleton: React.FC = () => {
  return (
    <Container size="xl">
      <Stack gap="xl" py={24}>
        <Skeleton height={36} width={360} radius="sm" />

        <Grid gutter="lg">
          <Grid.Col span={{ base: 6, sm: 3 }}><Skeleton height={110} radius="md" /></Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}><Skeleton height={110} radius="md" /></Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}><Skeleton height={110} radius="md" /></Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}><Skeleton height={110} radius="md" /></Grid.Col>
        </Grid>

        <Skeleton height={220} radius="lg" />

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 8 }}><Skeleton height={140} radius="md" /></Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}><Skeleton height={140} radius="md" /></Grid.Col>
        </Grid>

        <Skeleton height={48} radius="sm" />

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap={12}>
              <Skeleton height={28} width={200} radius="sm" />
              <Skeleton height={140} radius="md" />
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap={12}>
              <Skeleton height={28} width={160} radius="sm" />
              <Skeleton height={140} radius="md" />
            </Stack>
          </Grid.Col>
        </Grid>

        <Box style={{ height: 40 }} />
      </Stack>
    </Container>
  );
};

export default DashboardSkeleton;
