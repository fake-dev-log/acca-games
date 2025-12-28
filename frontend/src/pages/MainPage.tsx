import { useNavigate } from "react-router-dom";
import { Button } from '@components/common/Button';
import { ThemeToggleButton } from '@components/common/ThemeToggleButton';

export default function MainPage() {
    const navigate = useNavigate();

    function toGames() {
        navigate("/games");
    }

    return (
        <div className={"flex flex-col items-center justify-center w-full h-full bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"}>
            <div className="mb-8 text-3xl font-bold">AI 역량검사 전략게임 연습</div>
            <div className={"flex flex-col gap-4 p-8 w-64"}>
                <Button onClick={toGames} className={"py-2"}>게임</Button>
                {/* Records and Quit buttons removed for web standalone version */}
                <ThemeToggleButton />
            </div>
        </div>
    )
}