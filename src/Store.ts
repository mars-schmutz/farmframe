import { createSlice, configureStore } from "@reduxjs/toolkit";
import { Task } from "./types";

const loadState = () => {
    try {
        const serializedState = localStorage.getItem("farmframe");
        return serializedState ? JSON.parse(serializedState) : undefined;
    } catch (err) {
        console.error("Could not load state from local storage", err);
        return undefined;
    }
};

const saveState = (state: RootState) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem("farmframe", serializedState);
    } catch (err) {
        console.error("Could not save state to local storage", err);
    }
}

const persistedState = loadState();

const dailiesSlice = createSlice({
    name: "dailies",
    initialState: persistedState?.dailies || { tasks: [] },
    reducers: {
        addDaily: (state, action) => {
            state.tasks.push(action.payload);
        },
        completeDaily: (state, action) => {
            const taskId = action.payload;
            const task = state.tasks.find(task => task.id === taskId);
            if (task) {
                task.done = !task.done;
            }
        },
        resetDailies: (state, action) => {
            console.log("Reset dailies");
        }
    }
});

const weekliesSlice = createSlice({
    name: "weeklies",
    initialState: persistedState?.weeklies || { tasks: [] },
    reducers: {
        addWeekly: (state, action) => {
            state.tasks.push(action.payload);
        },
        completeWeekly: (state, action) => {
            const taskId = action.payload;
            const task = state.tasks.find(task => task.id === taskId);
            if (task) {
                task.done = !task.done;
            }
        },
        resetWeeklies: (state, action) => {
            console.log("Reset weeklies");
        }
    }
});

const todosSlice = createSlice({
    name: "todos",
    initialState: persistedState?.todos || { tasks: [] },
    reducers: {
        addTodo: (state, action) => {
            state.tasks.push(action.payload);
        },
        completeTodo: (state, action) => {
            const taskId = action.payload;
            state.tasks = state.tasks.filter(task => task.id !== taskId);
        }
    }
})

export const { addDaily, completeDaily } = dailiesSlice.actions;
export const { addWeekly, completeWeekly } = weekliesSlice.actions;
export const { addTodo, completeTodo } = todosSlice.actions;

export const store = configureStore({
    reducer: {
        dailies: dailiesSlice.reducer,
        weeklies: weekliesSlice.reducer,
        todos: todosSlice.reducer,
    },
    preloadState: persistedState,
});

store.subscribe(() => {
    saveState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
