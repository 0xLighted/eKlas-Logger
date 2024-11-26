import React from 'react';
import { DataItem } from './Item';

export const DataList = ({ data }) => (
    <div className="grid gap-4">
        {data.map((item) => (
            <DataItem key={item.$id} item={item} />
        ))}
    </div>
);