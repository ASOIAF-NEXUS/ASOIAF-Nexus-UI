import { Paper, Title, Text, Stack, Group } from "@mantine/core";

function HomePage() {
  return (
    <Stack>
      <Paper shadow="md" radius="sm" p="xl" withBorder><Title>Home Page</Title></Paper>
      <Paper shadow="xs" radius="md" p="xl" withBorder>ASOIAF Nexus is a community-driven, open-source platform designed to enhance and expand the tools available to ASOIAF players. Our goal is to complement ASOIAF Stats while providing new functionalities that serve narrative play, alternative tournament formats, and community-driven content.</Paper>
      <Paper shadow="xs" radius="md" p="xl" withBorder><Text>To establish an open-source, sustainable, and community-driven platform that enhances the ASOIAF gaming experience by providing tools that go beyond competitive tracking, supporting casual, narrative, and alternative formats.</Text></Paper>
      <Group justify="space-between">
        <Paper shadow="xs" radius="md" p="xl" withBorder>Did you know this project is open source?</Paper>
        <Paper shadow="xs" radius="md" p="xl" withBorder>Did you know this project is done by volonteers?</Paper>
      </Group>
    </Stack>
  );
}

export default HomePage;
