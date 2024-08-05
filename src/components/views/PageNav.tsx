import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import ListView from "./ListView";


interface PaginationProps {
    title: string;
    pairings: number[][];
    itemsPerPage: number;
    team?: number; 
}

const Pagination: React.FC<PaginationProps> = ({
    pairings,
    itemsPerPage,
    title,
}) => {
    const [activePage, setActivePage] = React.useState<number>(0);

    const totalPages = Math.ceil(pairings.length / itemsPerPage);

    const paginatedData = pairings.slice(
    activePage * itemsPerPage,
    (activePage + 1) * itemsPerPage
    );

    return (
    <Tabs selectedIndex={activePage} onSelect={(index) => setActivePage(index)}>
        <TabList>
            {Array.from({ length: totalPages }, (_, index) => (
            <Tab key={index}>Page {index + 1}</Tab>
        ))}
        </TabList>

        {Array.from({ length: totalPages }, (_, index) => (
        <TabPanel key={index}>
            <ListView
                title={title} 
                pairings={paginatedData}
                sortBy={"team"}
            />
        </TabPanel>
        ))}
    </Tabs>
    );
};

export default Pagination;
