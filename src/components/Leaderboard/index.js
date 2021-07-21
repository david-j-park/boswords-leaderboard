import React, { useEffect, useState } from "react";
import { useTable, useFilters } from 'react-table';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Leaderboard(props) {

    let { eventid } = useParams();

    const [event, setEvent] = useState();
    const [data, setStandings] = useState([]);
    const [columns, setColumns] = useState([]);
    const [typeFilter, setTypeFilter] = useState('All');
    // eslint-disable-next-line
    const [nameFilter, setNameFilter] = useState();
    
    // eslint-disable-next-line
    const [tagFilter, setTagFilter] = useState();
    //const [working, setWorking] = useState(false);

    
    //const [intialized, setInitialized] = useState(false);

    const tableInstance = useTable({
        columns, data
    }, useFilters);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = tableInstance;

    /* load the results */
    useEffect(() => {
        console.log('loading');
        console.log('initializing');
        axios.get(`https://4chbxgj610.execute-api.us-east-1.amazonaws.com/production/2`)
            .then(res => {
                let cols = [
                    {
                        Header: 'Overall Rank',
                        accessor: 'rank',
                    },
                    /*
                    {
                        Header: 'Pair/Individual Rank',
                        accessor: 'typerank'
                    },
                    */
                    {
                        Header: 'Name',
                        accessor: 'display_name'
                    },
                    {
                        Header: 'Division',
                        accessor: 'division'
                    },
                    {
                        Header: 'Overall Score',
                        accessor: 'totalScore'
                    },
                    {
                        Header: 'Type',
                        accessor: 'entry_type'
                    },
                    {
                        Header: 'Clean',
                        id: 'clean',
                        accessor: (row) => {
                            return row.clean && Object.keys(row.solves).length ? '*' : ''
                        }
                    }
                ];
                /* column group for each puzzle */
                res.data.event.puzzles.forEach(v => {
                    cols.push({
                        Header: `Puzzle ${v.Sequence} (${v.Words})`,
                        columns: [
                            {
                                Header: 'Score',
                                accessor: `solves.${v.id}.score`
                            },
                            {
                                Header: 'Time',
                                accessor: `solves.${v.id}.time`
                            },
                            {
                                Header: 'Correct',
                                accessor: `solves.${v.id}.correct`
                            },
                            
                        ]
                    })
                })
                setEvent(res.data.event);
                
                setStandings(res.data.entries);
                /*
                setStandings(res.data.entries.map((v, i) => {
                    if (v.totalScore < (res.data.entries[i-1] || {totalScore: -1}).totalScore) orank++;
                    if (v.entry_type === 'Individual') irank++;
                    else prank++;
                    return {
                        ...v,
                        rank: orank,
                        typerank: v.entry_type === 'Individual' ? irank : prank
                    }
                }));
                */
                setColumns(cols);
                if (res.data.event && res.data.event.divisions && res.data.event.divisions.length > 1) tableInstance.setFilter('division', res.data.event.divisions[0]);
                document.title = `Boswords: ${res.data.event.Title} Standings`; 
            })


    }, [eventid, tableInstance])

    const handleTypeChange = function (e) {
        setTypeFilter(e.target.value);
        tableInstance.setFilter('entry_type', e.target.value === 'All' ? null : e.target.value);
    }

    const handleNameChange = function (e) {
        setNameFilter(e.target.value);
        tableInstance.setFilter('display_name', e.target.value);
    }

    const handleDivChange = function (e) {
        tableInstance.setFilter('division', e.target.value);
    }

    return (
        <div>
            {
                event &&
                <div>
                    <h1>Leaderboard</h1>
                    <h2>{event.Title}</h2>
                    <div className="filters">
                        {
                            event.divisions && event.divisions.length > 1 && 
                            <div>
                                <label className="form-label">Choose a Division:</label>
                                <select className="form-control"name="divs" onChange={handleDivChange}>
                                    { event.divisions.map((v) => {
                                        return <option key={v} value={v}>{v}</option>
                                    })
                                    }
                                </select>
                            </div>
                        }
                        <label className="form-label">Filter by Entry Type:</label>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="typef" value="All" onChange={handleTypeChange} checked={typeFilter === 'All'} id="allradio" /> 
                            <label className="form-check-label" htmlFor="allradio">All</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="typef" value="Individual" onChange={handleTypeChange} checked={typeFilter === 'Individual'} id="indradio" /> 
                            <label className="form-check-label" htmlFor="indradio">Individuals</label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="radio" name="typef" value="Pair" onChange={handleTypeChange} checked={typeFilter === 'Pair'} id="pradio" /> 
                            <label className="form-check-label" htmlFor="pradio">Pairs</label>
                        </div>
                        <div>
                            <label className="form-label">Filter by name:</label> 
                            <input type="text" name="namefilter" onChange={handleNameChange} className="form-control" />
                        </div>
                        
                    </div>
                    <table {...getTableProps} className="table">
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