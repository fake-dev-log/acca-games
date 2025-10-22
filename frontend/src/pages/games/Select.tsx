export default function Select() {

    return (
        <div className={"grid grid-cols-5 gap-4 m-auto w-full"}>
            {Array.from({length:9}, (v,i)=>i)
                .map((key) => (
                    <div
                        key={key}
                    >
                        {key}
                    </div>
                ))}
        </div>
    )
}