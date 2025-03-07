import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import TaskView from "./views/TaskView";
import ArchonShardsView from "./views/ArchonShardsView";

export const routes = [
    {
        path: "/",
        element: <TaskView />
    },
    {
        path: "/archon-shards",
        element: <ArchonShardsView />
    }
]
