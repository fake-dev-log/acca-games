import {useNavigate} from "react-router-dom";
import {Quit} from "../../wailsjs/runtime";

export default function MainPage() {
    const navigate = useNavigate();

    function toGames() {
        navigate("/games");
    }

    function quit() {
        Quit();
    }

    return (
        <div className={"flex m-auto"}>
            <div className={"flex m-auto flex-col gap-4 p-8"}>
                <button onClick={toGames} className={"py-3 px-12 text-xl bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-200"}>게임</button>
                <button className={"py-3 px-12 text-xl bg-gray-400 text-white rounded-lg shadow-md cursor-not-allowed"} disabled>기록</button>
                <button className={"py-3 px-12 text-xl bg-gray-400 text-white rounded-lg shadow-md cursor-not-allowed"} disabled>설정</button>
                <button onClick={quit} className={"py-3 px-12 text-xl bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-all duration-200"}>종료</button>
            </div>
        </div>
    )
}