import React, { useEffect, useState } from "react";
import { useTable } from 'react-table';
import axios from 'axios';

function Leaderboard() {

    const [event, setEvent] = useState({});
    const [data, setStandings] = useState([]);


    /* columns and such */

    //const data = standings;

    const columns = React.useMemo(() =>
        [
            {
                Header: 'Name',
                accessor: 'display_name'
            },
            {
                Header: 'Total Score',
                accessor: 'totalScore'
            }
        ]
        , []);


    const tableInstance = useTable({
        columns, data
    });

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = tableInstance;

    /* load the results */
    useEffect(() => {
        axios.get('http://localhost:1337/standings/2')
            .then(res => {
                setEvent(res.data.event);
                setStandings(res.data.entries);
            })
    }, [])

    return (
        <div>
            {
                event &&
                <div>
                    <h1>Leaderboard</h1>
                    <h2>{event.Title}</h2>
                    <table {...getTableProps}>
                        <thead>
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {// Loop over the table rows
                                rows.map(row => {
                                    // Prepare the row for display
                                    prepareRow(row)
                                    return (
                                        // Apply the row props
                                        <tr {...row.getRowProps()}>
                                            {// Loop over the rows cells
                                                row.cells.map(cell => {
                                                    // Apply the cell props
                                                    return (
                                                        <td {...cell.getCellProps()}>
                                                            {// Render the cell contents
                                                                cell.render('Cell')}
                                                        </td>
                                                    )
                                                })}
                                        </tr>
                                    )
                                })}
                        </tbody>
                    </table>
                </div>

            }
            {
                !event && <h3>loading</h3>
            }
        </div>


    )
}

export default Leaderboard;