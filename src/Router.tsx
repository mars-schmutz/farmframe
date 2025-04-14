import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import TaskView from "./views/TaskView";
import ArchonShardsView from "./views/ArchonShardsView";
import Marketplace from "./views/MarketplaceView";

export const routes = [
    {
        path: "/",
        element: <TaskView />
    },
    {
        path: "/archon-shards",
        element: <ArchonShardsView />
    },
    {
        path: "/marketplace",
        element: <Marketplace />
    }
]
