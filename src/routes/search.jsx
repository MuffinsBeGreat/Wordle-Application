import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import GooeyNav from "@/components/GooeyNav";

export default function Search() {
    const [selectedData, setSelectedData] = useState(null);
    const items = [
        { label: "Home", href: "/dashboard" },
        { label: "Logout", href: "/" }
    ];

    return (
        <div className="p-6 max-w-xl mx-auto">
            <GooeyNav
                items={items}
                particleCount={15}
                particleDistances={[90, 10]}
                particleR={100}
                initialActiveIndex={0}
                animationTime={600}
                timeVariance={300}
                colors={[1, 2, 3, 1, 2, 3, 1, 4]}
            />
            <h1 className="text-3xl font-bold mb-4">Search</h1>
            <SearchBar onSelect={setSelectedData} />

            <br />
            <br />
            <br />
            <br />

            {selectedData && (
                <div className="mt-4">
                    <div>Selected Search Result</div>
                    <div>{selectedData.word}</div>
                    <div>{selectedData.description}</div>
                </div>
            )}
        </div>
    )
}