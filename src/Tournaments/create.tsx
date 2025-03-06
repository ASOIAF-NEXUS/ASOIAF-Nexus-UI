import { Box, Button, Group, Textarea, TextInput } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';

async function createTournament(tournament: Tournament) {
    console.log("Submitting tournament");
    try {
        const response = await fetch('http://localhost:8080/api/v1/tournaments', {
            method: 'POST',
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(tournament)
        });

        console.log(response);
        
        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json;
        console.log(result);
    }
    catch (e) {
        console.log("ERROR!");
        console.log(e);
    }
    
}

function Create() {
    const form = useForm<Tournament>({
        initialValues: { name: '', description: '', date: null, location: '', players: []}
    });

    return(
        <Box mx="auto">
            <form onSubmit={form.onSubmit((values: any) => createTournament(values))}>
                <TextInput 
                    withAsterisk 
                    label="Name" 
                    key={form.key('name')}
                    {...form.getInputProps('name')}
                />
                <Textarea
                    label="Description"
                    key={form.key('description')  }
                    {...form.getInputProps('description')} 
                />
                <DateTimePicker 
                    withAsterisk
                    label="Date"
                    key={form.key('date')}
                    {...form.getInputProps('date')}
                />
                <TextInput 
                    withAsterisk 
                    label="Location" 
                    key={form.key('location')}
                    {...form.getInputProps('location')}
                />

                <Group mt="md">
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Box>
    );
}

export default Create;

