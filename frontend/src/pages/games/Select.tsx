import { Link, useNavigate } from "react-router-dom";

export default function Select() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center m-auto p-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-8">게임 선택</h1>
                <div className={"grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"}>
                    <Link to={"/games/n-back/setup"} className={"block rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"}>
                        <div className={"border rounded-lg p-6 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer h-full"}>
                            <h2 className={"font-bold text-xl mb-2"}>도형 순서 기억하기</h2>
                            <p className={"text-sm text-gray-600"}>n-back</p>
                        </div>
                    </Link>
                    {/* New games will be added here */}
                </div>
            </div>
            <button onClick={() => navigate('/')} className="absolute top-4 left-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                뒤로가기
            </button>
        </div>
    )
}
