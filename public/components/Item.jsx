import { useEffect, useState } from 'react';

export const DataItem = ({ item }) => {
    const [highlight, setHighlight] = useState(false);

    useEffect(() => {
        // Flash effect when item updates
        setHighlight(true);
        const timer = setTimeout(() => setHighlight(false), 1000);
        return () => clearTimeout(timer);
    }, [item]); // Effect runs when item changes

    return (
        <div className={`border p-4 rounded shadow transition-colors duration-300 ${
            highlight ? 'bg-blue-50' : 'bg-white'
        }`}>
            <h2 className="text-xl">{item.Matric}</h2>
            <p>{item.Name}</p>
        </div>
    );
};