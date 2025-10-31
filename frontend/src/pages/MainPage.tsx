import { useNavigate } from "react-router-dom";
import { Quit } from "@wails/runtime";
import { PrimaryButton } from '@components/common/PrimaryButton';

export default function MainPage() {
    const navigate = useNavigate();

    function toGames() {
        navigate("/games");
    }

    function quit() {
        Quit();
    }

    return (
        <div className={"flex flex-col items-center justify-center w-full h-full bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"}>
            <div className={"flex flex-col gap-4 p-8"}>
                <PrimaryButton onClick={toGames} className={"bg-primary-light dark:bg-primary-dark text-text-light dark:text-text-dark border-primary-light dark:border-primary-dark hover:bg-button-primary-hover-light dark:hover:bg-button-primary-hover-dark focus:ring-primary-light dark:focus:ring-primary-dark"}>게임</PrimaryButton>
                <PrimaryButton onClick={() => navigate('/records')} className={"bg-primary-light dark:bg-primary-dark text-text-light dark:text-text-dark border-primary-light dark:border-primary-dark hover:bg-button-primary-hover-light dark:hover:bg-button-primary-hover-dark focus:ring-primary-light dark:focus:ring-primary-dark"}>기록</PrimaryButton>
                <PrimaryButton className={"bg-button-primary-disabled-light dark:bg-button-primary-disabled-dark text-button-disabled-text-light dark:text-button-disabled-text-dark border-button-primary-disabled-light dark:border-button-primary-disabled-dark cursor-not-allowed"} disabled>설정</PrimaryButton>
                <PrimaryButton onClick={quit} className={"bg-danger text-text-light dark:text-text-dark border-danger hover:bg-button-danger-hover-light dark:hover:bg-button-danger-hover-dark focus:ring-danger dark:focus:ring-danger-dark"}>종료</PrimaryButton>
            </div>
        </div>
    )
}