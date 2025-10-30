import './App.css';
import React from "react";
import RoutesProvider from "@routes/RoutesProvider";

function App() {

    return (
        <div id={"app"} className={"w-full"}>
            <RoutesProvider />
        </div>
    )
}

export default App
