import { HashRouter, Route, Routes } from "react-router-dom";
import MainPage from "@pages/MainPage";
import Select from "@pages/games/Select";
import { NBackGameSetup } from "@pages/games/NBackGameSetup";
import { NBackGame } from "@pages/games/NBackGame";
import { RecordsIndex } from "@pages/records/RecordsIndex";
import { NBackRecords } from "@pages/records/NBackRecords";
import { NBackSessionDetail } from "@pages/records/NBackSessionDetail"; // Import NBackSessionDetail
import { RpsGameSetup } from "@pages/games/RpsGameSetup";
import { RpsGame } from "@pages/games/RpsGame";
import { RpsRecords } from "@pages/records/RpsRecords";
import { RpsSessionDetail } from "@pages/records/RpsSessionDetail";

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
                <Route
                    path={"/records/rps"}
                    element={<RpsRecords />}
                />
                <Route
                    path={"/records/rps/:sessionId"}
                    element={<RpsSessionDetail />}
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
                    <Route
                        path={"rps/setup"}
                        element={<RpsGameSetup />}
                    />
                    <Route
                        path={"rps/play"}
                        element={<RpsGame />}
                    />
                </Route>
            </Routes>
        </HashRouter>
    )
}
