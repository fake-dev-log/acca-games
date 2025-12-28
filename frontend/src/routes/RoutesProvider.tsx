import { HashRouter, Route, Routes } from "react-router-dom";
import MainPage from "@pages/MainPage";
import { Select } from "@pages/games/Select";
import NBackPage from '@pages/games/NBackPage';

// Records imports removed for standalone version
// import { RecordsIndex } from "@pages/records/RecordsIndex";
// ... (other record imports)

import RpsPage from '@pages/games/RpsPage';

import NumberPressingPage from '@pages/games/NumberPressingPage';

import ShapeRotationPage from "@pages/games/ShapeRotationPage";
import CountComparisonPage from "@pages/games/CountComparisonPage";
import CatChaserPage from "@pages/games/CatChaserPage";
import { GameCodeSlugs } from "@constants/gameCodes";

export default function RoutesProvider() {


    return (
        <HashRouter basename={"/"}>
            <Routes>
                <Route
                    path={""}
                    element={<MainPage />}
                />
                {/* Records routes removed for standalone version */}
                
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
          <Route path={GameCodeSlugs.COUNT_COMPARISON} element={<CountComparisonPage />} />
          <Route path={GameCodeSlugs.CAT_CHASER} element={<CatChaserPage />} />
                </Route>
            </Routes>
        </HashRouter>
    )
}
