import {HashRouter, Route, Routes} from "react-router-dom";
import MainPage from "@pages/MainPage";
import Select from "@pages/games/Select";

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
                </Route>
            </Routes>
        </HashRouter>
    )
}