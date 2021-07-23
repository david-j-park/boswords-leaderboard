import React, { useEffect, useState } from "react";
import { useTable, useFilters, useBlockLayout } from 'react-table';
import { useParams } from 'react-router-dom';
import { FixedSizeList } from 'react-window';
import styled from 'styled-components';
import scrollbarWidth from '../scrollbarWidth'


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

    const scrollBarSize = React.useMemo(() => scrollbarWidth(), []);

    const Styles = styled.div`
  padding: 1rem;

  .table {
    display: inline-block;
    border-spacing: 0;
    border: 1px solid black;
    width: auto;
    border-right-width: 0;

    .tr {
      :last-child {
        .td {
          border-bottom: 0;
        }
      }
    }

    .th,
    .td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 1px solid black;
      }
    }

    .th {
        font-weight: bold;
        text-align: center;
        border-bottom: 1px solid black;
    }
  }
`

const defaultColumn = React.useMemo(
    () => ({
      width: 100
    }),
    []
  )


    const tableInstance = useTable({
        columns, data, defaultColumn
    }, useBlockLayout, useFilters);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        totalColumnsWidth,
        prepareRow,
    } = tableInstance;

    const RenderRow = React.useCallback(
        ({ index, style }) => {
          const row = rows[index]
          prepareRow(row)
          return (
            <div
              {...row.getRowProps({
                style,
              })}
              className="tr"
            >
              {row.cells.map(cell => {
                return (
                  <div {...cell.getCellProps()} className="td">
                    {cell.render('Cell')}
                  </div>
                )
              })}
            </div>
          )
        },
        [prepareRow, rows]
      )

    /* load the results */
    useEffect(() => {
        console.log('loading');
        console.log('initializing');
        axios.get(`https://4chbxgj610.execute-api.us-east-1.amazonaws.com/production/${eventid}`)
            .then(res => {
                let cols = [
                    {Header: '',
                     id: 'empty',
                    columns: [
                        {
                            Header: 'Overall Rank',
                            accessor: 'rank',
                            width: 70
                        },
                        /*
                        {
                            Header: 'Pair/Individual Rank',
                            accessor: 'typerank'
                        },
                        */
                        {
                            Header: 'Name',
                            accessor: 'display_name',
                            width: 300
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
                            Header: '',
                            id: 'clean',
                            accessor: (row) => {
                                return row.clean && Object.keys(row.solves).length ? '*' : ''
                            },
                            width: 25
                        }
    
                    ]}
                ];
                /* column group for each puzzle */
                res.data.event.puzzles.sort((a, b) => {
                    return b.Sequence - a.Sequence;
                }).forEach(v => {
                    cols.push({
                        Header: `Puzzle ${v.Sequence} (${v.Words})`,
                        columns: [
                            {
                                Header: 'Score',
                                accessor: `solves.${v.id}.score`,
                                width: 70
                            },
                            {
                                Header: 'Time',
                                accessor: `solves.${v.id}.time`,
                                width: 70

                            },
                            {
                                Header: 'Correct',
                                accessor: `solves.${v.id}.correct`,
                                width: 70
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
                    <h2>{event.Title}</h2>
                    <div className="filters">
                        {
                            event.divisions && event.divisions.length > 1 &&
                            <div>
                                <label className="form-label">Choose a Division:</label>
                                <select className="form-control" name="divs" onChange={handleDivChange}>
                                    {event.divisions.map((v) => {
                                        return <option key={v} value={v}>{v}</option>
                                    })
                                    }
                                </select>
                            </div>
                        }
                        <p className="form-label">Filter by Entry Type:</p>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="typef" value="All" onChange={handleTypeChange} checked={typeFilter === 'All'} id="allradio" />
                            <label className="form-check-label" htmlFor="allradio">All</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="typef" value="Individual" onChange={handleTypeChange} checked={typeFilter === 'Individual'} id="indradio" />
                            <label className="form-check-label" htmlFor="indradio">Individuals</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="typef" value="Pair" onChange={handleTypeChange} checked={typeFilter === 'Pair'} id="pradio" />
                            <label className="form-check-label" htmlFor="pradio">Pairs</label>
                        </div>
                        <div>
                            <label className="form-label">Filter by name:</label>
                            <input type="text" name="namefilter" value={nameFilter} onChange={handleNameChange} className="form-control" />
                        </div>

                    </div>
                    <Styles>
                    <div {...getTableProps()} className="table">
                        <div>
                            {headerGroups.map(headerGroup => (
                                <div {...headerGroup.getHeaderGroupProps()} className="tr">
                                    {headerGroup.headers.map(column => (
                                        <div {...column.getHeaderProps()} className="th">
                                            {column.render('Header')}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div {...getTableBodyProps()}>
                            <FixedSizeList
                                height={400}
                                itemCount={rows.length}
                                itemSize={35}
                                width={totalColumnsWidth + scrollBarSize}
                            >
                                {RenderRow}
                            </FixedSizeList>
                        </div>
                    </div>
                    </Styles>
                </div>

            }
            {
                !event && <h3>loading</h3>
            }
        </div>


    )
}

export default Leaderboard;