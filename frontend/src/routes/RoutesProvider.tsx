import { HashRouter, Route, Routes } from "react-router-dom";
import MainPage from "@pages/MainPage";
import { Select } from "@pages/games/Select";
import { RecordsIndex } from "@pages/records/RecordsIndex";
import { GameRecordsPage } from "@pages/records/GameRecordsPage";
import { SessionDetailPage } from "@pages/records/SessionDetailPage";
import { GamePage } from "@components/layout/GamePage";
import { GAMES } from "@games/registry";

export default function RoutesProvider() {
    return (
        <HashRouter>
            <Routes>
                <Route path="" element={<MainPage />} />
                <Route path="/games">
                    <Route path="" element={<Select />} />
                    {GAMES.map((game) => (
                        <Route key={game.slug} path={game.slug} element={<GamePage game={game} />} />
                    ))}
                </Route>
                <Route path="/records">
                    <Route path="" element={<RecordsIndex />} />
                    <Route path=":slug" element={<GameRecordsPage />} />
                    <Route path=":slug/:sessionId" element={<SessionDetailPage />} />
                </Route>
            </Routes>
        </HashRouter>
    )
}
