import React from "react";
import { useDispatch, useSelector } from "react-redux";
import TaskList from "./TaskList";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { Modal, TextInput, Button } from "@mantine/core";
import { v4 as uuidv4 } from "uuid";
import {
    addWeekly,
    completeWeekly,
    type RootState,
} from "../../Store";

const WeeklyTasks = React.FC = () => {
    const dispatch = useDispatch();
    const weeklies = useSelector((state: RootState) => state.weeklies.tasks);
    const [opened, { open, close }] = useDisclosure(false);
    const newWeeklyForm = useForm({
        mode: "uncontrolled",
        initialValues: {
            detaisl: "",
            id: "",
        }
    })

    const saveNewWeekly = (values: typeof newWeeklyForm.values) => {
        let { id, details } = values;
        id = uuidv4();
        const task = {
            details: details,
            id: id,
            done: false,
            notes: "",
        }

        dispatch(addWeekly(task));
        close();
        newWeeklyForm.reset();
    }

    const handleOnCheck = (id: string) => {
        dispatch(completeWeekly(id));
    }

    return (
        <>
        <Modal opened={opened} onClose={close} title="New Weekly Task">
            <form onSubmit={newWeeklyForm.onSubmit(saveNewWeekly)}>
                <TextInput
                label="Task"
                key={newWeeklyForm.key("details")}
                { ...newWeeklyForm.getInputProps("details")} />

                <Button type="submit">Submit</Button>
            </form>
        </Modal>
        <TaskList title="Weeklies" tasks={weeklies} newTask={open} onCheck={handleOnCheck} />
        </>
    )
}

export default WeeklyTasks;
