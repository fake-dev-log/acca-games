import { HashRouter, Route, Routes } from "react-router-dom";
import MainPage from "@pages/MainPage";
import { Select } from "@pages/games/Select";
import NBackPage from '@pages/games/NBackPage';

import { RecordsIndex } from "@pages/records/RecordsIndex";
import { NBackRecords } from "@features/n-back/records/NBackRecords";
import { NBackSessionDetail } from "@features/n-back/records/NBackSessionDetail";
import { RpsRecords } from "@features/rps/records/RpsRecords";
import { RpsSessionDetail } from "@features/rps/records/RpsSessionDetail";
import { NumberPressingRecords } from "@features/number-pressing/records/NumberPressingRecords";
import { NumberPressingSessionDetail } from "@features/number-pressing/records/NumberPressingSessionDetail";
import { ShapeRotationRecords } from "@features/shape-rotation/records/ShapeRotationRecords";
import { ShapeRotationSessionDetail } from "@features/shape-rotation/records/ShapeRotationSessionDetail";



import RpsPage from '@pages/games/RpsPage';

import NumberPressingPage from '@pages/games/NumberPressingPage';

import ShapeRotationPage from "@pages/games/ShapeRotationPage";
import { GameCodeSlugs } from "@constants/gameCodes";

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
                    path={`/records/${GameCodeSlugs.N_BACK}`}
                    element={<NBackRecords />}
                />
                <Route
                    path={`/records/${GameCodeSlugs.N_BACK}/:sessionId`} // New route for session detail
                    element={<NBackSessionDetail />}
                />
                <Route
                    path={`/records/${GameCodeSlugs.RPS}`}
                    element={<RpsRecords />}
                />
                <Route
                    path={`/records/${GameCodeSlugs.RPS}/:sessionId`}
                    element={<RpsSessionDetail />}
                />
                <Route
                    path={`/records/${GameCodeSlugs.NUMBER_PRESSING}`}
                    element={<NumberPressingRecords />}
                />
                <Route
                    path={`/records/${GameCodeSlugs.NUMBER_PRESSING}/:sessionId`}
                    element={<NumberPressingSessionDetail />}
                />
                <Route
                    path={`/records/${GameCodeSlugs.SHAPE_ROTATION}`}
                    element={<ShapeRotationRecords />}
                />
                <Route
                    path={`/records/${GameCodeSlugs.SHAPE_ROTATION}/:sessionId`}
                    element={<ShapeRotationSessionDetail />}
                />
                <Route path={"/games"}>
                    <Route
                        path={""}
                        element={<Select />}
                    />
          <Route path={GameCodeSlugs.N_BACK} element={<NBackPage />} />
          <Route path={GameCodeSlugs.RPS} element={<RpsPage />} />
          <Route path={GameCodeSlugs.NUMBER_PRESSING} element={<NumberPressingPage />} />
                    <Route
                        path={GameCodeSlugs.SHAPE_ROTATION}
                        element={<ShapeRotationPage />}
                    />
                </Route>
            </Routes>
        </HashRouter>
    )
}
