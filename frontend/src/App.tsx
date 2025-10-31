import './App.css';
import RoutesProvider from "@routes/RoutesProvider";

function App() {

    return (
        <div id={"app"} className={"bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark min-h-screen"}>
            <RoutesProvider />
        </div>
    )
}

export default App
