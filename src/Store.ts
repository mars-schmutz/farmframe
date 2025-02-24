import { createSlice, configureStore } from "@reduxjs/toolkit";
import { Task } from "./types";

const dailiesSlice = createSlice({
    name: "dailies",
    initialState: {
        tasks: [],
    },
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
    initialState: {
        tasks: [],
    },
    reducers: {
        addWeekly: (state, action) => {
            state.tasks.push(action.payload);
        },
        completeWeekly: (state, action) => {
            const { taskId } = action.payload;
            const idx = state.tasks.findIndex(task => task.id === taskId);
            state.tasks[idx] = { ...state.tasks[idx], done: true };
        },
        resetWeeklies: (state, action) => {
            console.log("Reset weeklies");
        }
    }
})

export const { addDaily, completeDaily } = dailiesSlice.actions;
export const { addWeekly, completeWeekly } = weekliesSlice.actions;

export const store = configureStore({
    reducer: {
        dailies: dailiesSlice.reducer,
        weeklies: weekliesSlice.reducer,
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
