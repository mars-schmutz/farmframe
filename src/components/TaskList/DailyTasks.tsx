import React from "react";
import TaskList from "./TaskList";
import { useSelector, useDispatch } from "react-redux";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { Modal, TextInput, Button } from "@mantine/core";
import { v4 as uuidv4 } from "uuid";
import {
    addDaily,
    completeDaily,
    type RootState,
} from "../../Store";

const DailyTasks = React.FC = () => {
    const dispatch = useDispatch();
    const dailies = useSelector((state: RootState) => state.dailies.tasks);
    const [opened, { open, close }] = useDisclosure(false);
    const newDailyForm = useForm({
        mode: "uncontrolled",
        initialValues: {
            details: "",
            id: "",
        }
    })

    // const addNewDaily = () => {
    //     open();
    // }

    const saveNewDaily = (values: typeof newDailyForm.values) => {
        let { id, details } = values;
        id = uuidv4();
        const task = {
            details: details,
            id: id,
            done: false,
            notes: "",
        }

        dispatch(addDaily(task));
        close();
        newDailyForm.reset();
    }

    const handleOnCheck = (id: string) => {
        dispatch(completeDaily(id))
    }

    return (
        <>
        <Modal opened={opened} onClose={close} title="New Daily Task">
            <form onSubmit={newDailyForm.onSubmit(saveNewDaily)}>
                <TextInput
                label="Task"
                key={newDailyForm.key("details")}
                { ...newDailyForm.getInputProps("details")} />

                <Button type="submit">Submit</Button>
            </form>
        </Modal>
        <TaskList title="Dailies" tasks={dailies} newTask={open} onCheck={handleOnCheck}/>
        </>
    )
}

export default DailyTasks;
