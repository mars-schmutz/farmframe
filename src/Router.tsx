import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import TaskView from "./views/TaskView";

export const routes = [
    {
        path: "/",
        element: <TaskView />
    }
]
