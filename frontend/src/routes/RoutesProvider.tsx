import {HashRouter, Route, Routes} from "react-router-dom";
import MainPage from "@pages/MainPage";
import Select from "@pages/games/Select";
import {NBackGameSetup} from "@pages/games/NBackGameSetup";
import {NBackGame} from "@pages/games/NBackGame";

export default function RoutesProvider() {

    return (
        <HashRouter basename={"/"}>
            <Routes>
                <Route
                    path={""}
                    element={<MainPage />}
                />
                <Route path={"/games"}>
                    <Route
                        path={""}
                        element={<Select />}
                    />
                    <Route
                        path={"n-back/setup"}
                        element={<NBackGameSetup />}
                    />
                    <Route
                        path={"n-back/play"}
                        element={<NBackGame />}
                    />
                </Route>
            </Routes>
        </HashRouter>
    )
}