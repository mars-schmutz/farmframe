import React from "react";
import { Group, Title, Box, Checkbox, ActionIcon } from "@mantine/core";
import { Task } from "../types";
import { IconSquarePlus } from "@tabler/icons-react";

interface TaskListProps {
    title: string;
    tasks: Task[];
    newTask: () => void;
    onCheck: () => void;
}

const TaskList: React.FC<TaskListProps> = ({title, tasks, newTask, onCheck}) => {
    return (
        <Box>
            <Group justify="space-between">
                <Title order={3}>{title}</Title>
				<ActionIcon
				onClick={newTask}
				variant="subtle">
				    <IconSquarePlus />
				</ActionIcon>
            </Group>
            <ul>
                {tasks.map((task, i) => (
                    <Checkbox
                    key={i}
                    checked={task.done}
                    label={task.details}
                    onChange={() => {onCheck(task.id)}}
                    mt="xs"
                    mb="xs"
                    />
                ))}
            </ul>
        </Box>
    )
}

export default TaskList;
