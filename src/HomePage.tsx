import { Paper, Title, Text, Stack, Group } from "@mantine/core";

function HomePage() {
  return (
    <Stack>
      <Paper shadow="md" radius="sm" p="xl" withBorder><Title>Home Page</Title></Paper>
      <Paper shadow="xs" radius="md" p="xl" withBorder>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quod soluta doloribus quaerat illum laborum cupiditate error eos maiores ratione molestiae id ea vel facilis et vitae, quas tenetur? Incidunt, inventore.</Paper>
      <Paper shadow="xs" radius="md" p="xl" withBorder><Text>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Porro sunt nisi eligendi, harum suscipit fugit obcaecati voluptatibus velit culpa magnam asperiores eos rem quaerat, distinctio perferendis esse assumenda veritatis odio.</Text></Paper>
      <Group justify="space-between">
        <Paper shadow="xs" radius="md" p="xl" withBorder>Did you know this project is open source?</Paper>
        <Paper shadow="xs" radius="md" p="xl" withBorder>Did you know this project is done by volonteers?</Paper>
      </Group>
    </Stack>
  );
}

export default HomePage;
