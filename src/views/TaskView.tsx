import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useDisclosure } from "@mantine/hooks";
import TaskList from "../components/TaskList/TaskList";
import DailyTasks from "../components/TaskList/DailyTasks";
import { Container, Group, Box, Modal } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Task } from "../types";
import { v4 as uuidv4 } from "uuid";
import {
    addDaily,
    completeDaily,
    type RootState,
} from "../Store";

const TaskView: React.FC = () => {
    const dispatch = useDispatch();
    const dailies = useSelector((state: RootState) => state.dailies.tasks);
    const [opened, { open, close }] = useDisclosure(false);
    const newTaskForm = useForm({
        mode: "uncontrolled",
        initialValues: {
            details: "",
            id: "",
        },
    })

    return (
        <>
        <Modal opened={opened} onClose={close} title="New Task">
        </Modal>
        <Box>
            <Group justify="center">
                <DailyTasks />
                <TaskList title="Weeklies" tasks={[]} />
            </Group>
        </Box>
        </>
    )
}

export default TaskView;
