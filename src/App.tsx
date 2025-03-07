import "@mantine/core/styles.css";
import {
    AppShell,
    Burger,
    Box,
    NavLink,
    Title
} from "@mantine/core";
import {
    IconListCheck,
    IconDiamond
} from "@tabler/icons-react";
import { useDisclosure } from '@mantine/hooks';
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { routes } from "./Router";
import { useState, useEffect } from "react";

import TaskView from "./views/TaskView";
import ArchonShardsView from "./views/ArchonShardsView";

const navData = [
    { icon: IconListCheck, label: "Tasks", to: "/"},
    { icon: IconDiamond, label: "Archon Shards", to: "/archon-shards"},
]

const App: React.FC = () => {
    const [opened, { toggle }] = useDisclosure();
    const [active, setActive] = useState(0);
    const navigate = useNavigate();

    const navLinks = navData.map((item, idx) => (
        <NavLink
            key={ item.label }
            active={ idx === active }
            label={ item.label }
            leftSection={ <item.icon size={32} stroke={1.5} /> }
            onClick={() => {
                setActive(idx)
                navigate(item.to)
            }}
        />
    ))

    return (
        <AppShell
        header={{ height: 60 }}
        navbar={{
            width: 300,
            breakpoint: "sm",
            collapsed: { mobile: !opened }
        }}
        padding="md"
        >
            <AppShell.Header>
                <Burger
                opened={ opened }
                onClick={ toggle }
                hiddenFrom="sm"
                size="sm"
                />
                <Title>Farmframe</Title>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <Box>{ navLinks }</Box>
            </AppShell.Navbar>

            <AppShell.Main>
                <Routes>
                    {routes.map((route, idx) => (
                        <Route key={idx} path={route.path} element={route.element} />
                    ))}
                </Routes>
            </AppShell.Main>
        </AppShell>
    )
}

export default App;
