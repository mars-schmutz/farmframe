import React from "react";
import TaskList from "../components/TaskList";
import { Container, Group, Box } from "@mantine/core";
import { Task } from "../types";

const TaskView: React.FC = () => {
    const tasks: Task[] = [
        { details: "Lavos Prime", done: false },
        { details: "Cedo Prime", done: false },
        { details: "Lose sanity", done: true },
    ]
    return (
        <Box>
            <Group justify="center">
                <TaskList title="Dailies" tasks={tasks} />
                <TaskList title="Weeklies" tasks={tasks} />
            </Group>
        </Box>
    )
}

export default TaskView;
