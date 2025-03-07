import React from "react";
import { useDispatch, useSelector } from "react-redux";
import TaskList from "./TaskList";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { Modal, TextInput, Button } from "@mantine/core";
import { v4 as uuidv4 } from "uuid";
import {
    addTodo,
    completeTodo,
    type RootState,
} from "../../Store";

const TodoTasks = React.FC = () => {
    const dispatch = useDispatch();
    const todos = useSelector((state: RootState) => state.todos.tasks);
    const [opened, { open, close }] = useDisclosure(false);
    const newTodoForm = useForm({
        mode: "uncontrolled",
        initialValues: {
            detaisl: "",
            id: "",
        }
    })

    const saveNewTodo = (values: typeof newTodoForm.values) => {
        let { id, details } = values;
        id = uuidv4();
        const task = {
            details: details,
            id: id,
            done: false,
            notes: "",
        }

        dispatch(addTodo(task));
        close();
        newTodoForm.reset();
    }

    const handleOnCheck = (id: string) => {
        dispatch(completeTodo(id));
    }

    return (
        <>
        <Modal opened={opened} onClose={close} title="New Todo">
            <form onSubmit={newTodoForm.onSubmit(saveNewTodo)}>
                <TextInput
                label="Task"
                key={newTodoForm.key("details")}
                { ...newTodoForm.getInputProps("details")} />

                <Button type="submit">Submit</Button>
            </form>
        </Modal>
        <TaskList title="Todos" tasks={todos} newTask={open} onCheck={handleOnCheck} />
        </>
    )
}

export default TodoTasks;
