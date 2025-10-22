import './App.css';
import React from "react";
import RoutesProvider from "@routes/RoutesProvider";

function App() {

    return (
        <div id={"app"}>
            <RoutesProvider />
        </div>
    )
}

export default App
