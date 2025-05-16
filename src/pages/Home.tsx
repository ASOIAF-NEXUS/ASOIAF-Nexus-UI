import {Anchor, Group, List, Paper, Stack, Text, Title} from "@mantine/core";

function Home() {
  return (
    <Stack>
      <Paper shadow="md" radius="sm" p="xl" withBorder><Title>Home Page</Title></Paper>
      <Paper shadow="xs" radius="md" p="xl" withBorder><Text>We need your help defining the future of ASOIAF tools. </Text><Text> Please take this <Anchor styles={{root: { fontWeight: 700 }}} href="https://forms.office.com/r/e4U5grfyWK">survey</Anchor> to contribute to ASOIAF's future.</Text></Paper>
      <Paper shadow="xs" radius="md" p="xl" withBorder>
        <Stack gap="md">
        <Title>Mission</Title>
        <Text styles={{ root: { textAlign: "left" }}}>ASOIAF Nexus is a <b>community-driven, open-source platform</b> designed to enhance and expand the tools available to ASOIAF players. Our goal is to complement ASOIAF Stats while providing new functionalities that serve <b>narrative play, alternative tournament formats</b>, and <b>community-driven content.</b></Text>
        </Stack>
      </Paper>
      <Paper shadow="xs" radius="md" p="xl" withBorder>
        <Stack gap="md">
        <Title>Vision</Title>
        <Text styles={{ root: { textAlign: "left"}}}>To establish an <b>open-source, sustainable,</b> and <b>community-driven platform </b>that enhances the ASOIAF gaming experience by providing tools that go beyond competitive tracking, supporting casual, narrative, and alternative formats.</Text>
        </Stack>
      </Paper>
      <Paper shadow="xs" radius="md" p="xl" withBorder>
        <Title>
          Key Objectives
        </Title>
        <List styles={{ item: { textAlign: "left"}}}>
            <List.Item>
              <Text><b>Expand Accessibility</b> to ensure players of all types, competitive, casual and narrative, have tools tailored to their needs.</Text>
            </List.Item>
            <List.Item>
              <Text><b>Future-Proof the Community</b> to reduce dependency on a single entity for tournament organisation and player tracking.</Text>
            </List.Item>
            <List.Item>
              <Text><b>Encourage Innovation </b> by creating a system that allows community-driven development and feature expansion.
              </Text>
            </List.Item>
          </List>
        </Paper>
      <Group justify="space-between">
        <Paper shadow="xs" radius="md" p="xl" withBorder>Did you know this project is open source?</Paper>
        <Paper shadow="xs" radius="md" p="xl" withBorder>Did you know this project is done by volunteers?</Paper>
      </Group>
    </Stack>
  );
}

export default Home;
