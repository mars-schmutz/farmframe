import React from "react";
import { Title, Box, Checkbox } from "@mantine/core";
import { Task } from "../types";

interface TaskListProps {
    title: string,
    tasks: Task[]
}

const TaskList: React.FC<TaskListProps> = ({title, tasks}) => {
    console.log(tasks)
    return (
        <Box>
            <Title order={3}>{title}</Title>
            <ul>
                {tasks.map((task, i) => (
                    <Checkbox
                    key={i}
                    checked={task.done}
                    label={task.details}
                    mt="xs"
                    mb="xs"
                    />
                ))}
            </ul>
        </Box>
    )
}

export default TaskList;
