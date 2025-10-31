import { HashRouter, Route, Routes } from "react-router-dom";
import MainPage from "@pages/MainPage";
import Select from "@pages/games/Select";
import { NBackGameSetup } from "@pages/games/NBackGameSetup";
import { NBackGame } from "@pages/games/NBackGame";
import { RecordsIndex } from "@pages/records/RecordsIndex";
import { NBackRecords } from "@pages/records/NBackRecords";
import { NBackSessionDetail } from "@pages/records/NBackSessionDetail"; // Import NBackSessionDetail

export default function RoutesProvider() {

    return (
        <HashRouter basename={"/"}>
            <Routes>
                <Route
                    path={""}
                    element={<MainPage />}
                />
                <Route
                    path={"/records"}
                    element={<RecordsIndex />}
                />
                <Route
                    path={"/records/n-back"}
                    element={<NBackRecords />}
                />
                <Route
                    path={"/records/n-back/:sessionId"} // New route for session detail
                    element={<NBackSessionDetail />}
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
