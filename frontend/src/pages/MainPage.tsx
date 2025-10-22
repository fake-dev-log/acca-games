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
            <div className={"flex m-auto flex-col gap-1"}>
                <button onClick={toGames}>게임</button>
                <button>기록</button>
                <button>설정</button>
                <button onClick={quit}>종료</button>
            </div>
        </div>
    )
}