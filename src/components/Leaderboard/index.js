import React, { useEffect, useState } from "react";
import { useTable, useFilters, useFlexLayout, useResizeColumns } from 'react-table';
import { useParams } from 'react-router-dom';
import { FixedSizeList } from 'react-window';
import styled from 'styled-components';
import scrollbarWidth from '../scrollbarWidth'
import Cookies from 'universal-cookie';
import PuzzleStatistics  from "../PuzzleStatistics";

import axios from 'axios';

const cookies = new Cookies();

function Leaderboard(props) {

    let { eventid } = useParams();

    const [event, setEvent] = useState();
    const [data, setStandings] = useState([]);
    const [columns, setColumns] = useState([]);
    const [typeFilter, setTypeFilter] = useState('All');
    const [divFilter, setDivFilter] = useState();
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
          border-bottom-width: 1px;
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

        .resizer {
            display: inline-block;
            width: 10px;
            height: 100%;
            position: absolute;
            right: 0;
            top: 0;
            transform: translateX(50%);
            z-index: 1;
            ${'' /* prevents from scrolling while dragging on touch devices */}
            touch-action:none;
    
            &.isResizing {
              background: red;
            }
          }
    }

    .td {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        
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
    }, useFlexLayout, useFilters, useResizeColumns);

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

    /* check for IE */
    useEffect(() => {
        if (window.navigator.userAgent.match(/MSIE|Trident/) !== null){
            alert('You appear to be running Internet Explorer, which our site does not entirely support. We strongly reccomend using Chrome, Firefox or Microsoft Edge for the best experience.');
        }
    }, []);

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
                        {
                            Header: 'Ind./Pr. Rank',
                            accessor: 'typeRank',
                            width: 70
                        },
                        {
                            Header: 'Name',
                            accessor: 'display_name',
                            width: 300,
                            maxWidth: 500
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
                            Header: '*',
                            id: 'clean',
                            accessor: (row) => {
                                return row.clean && Object.keys(row.solves).length ? '*' : ''
                            },
                            width: 25
                        }
    
                    ]}
                ];
                if (res.data.event.divisions && res.data.event.divisions.length > 1){
                    cols[0].columns.splice(3, 0, 
                        {
                            Header: 'Division',
                            accessor: 'division'
                        }
                    );
                }
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
                
                if (res.data.event && res.data.event.divisions && res.data.event.divisions.length > 1) {
                    tableInstance.setFilter('division', cookies.get('division_filter') || res.data.event.divisions[0]);
                    setDivFilter(cookies.get('division_filter') || res.data.event.divisions[0]);
                }
                tableInstance.setFilter('entry_type', cookies.get('entry_type_filter') === 'All' ? null : cookies.get('entry_type_filter'));
                setTypeFilter(cookies.get('entry_type_filter'));
                document.title = `Boswords: ${res.data.event.Title} Standings`;
            })

    // eslint-disable-next-line
    }, [eventid, tableInstance])

    const handleTypeChange = function (e) {
        setTypeFilter(e.target.value);
        tableInstance.setFilter('entry_type', e.target.value === 'All' ? null : e.target.value);
        cookies.set('entry_type_filter', e.target.value);
    }

    const handleNameChange = function (e) {
        setNameFilter(e.target.value);
        tableInstance.setFilter('display_name', e.target.value);
    }

    const handleDivChange = function (e) {
        setDivFilter(e.target.value);
        tableInstance.setFilter('division', e.target.value);
        cookies.set('division_filter', e.target.value);
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
                            <div className="row g-3">
                                <div className="col-2">Choose a Division:</div>
                                    <div className="col-4">
                                    {event.divisions.map((v) => {
                                        return <div className="form-check form-check-inline">
                                                <input className="form-check-input" type="radio" name="divr" value={v} onChange={handleDivChange} checked={divFilter === v} id={`${v}radio`}/>
                                                <label className="form-check-label" htmlFor={`${v}radio`}>{v}</label>
                                            </div>
                                    })
                                    }
                                    </div>
                                
                            </div>
                        }
                        <div className="row g-3">
                            <div class="col-2">Filter by Entry Type:</div>
                            <div className="col-4">
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
                            </div>
                        </div>
                        <div className="row g-3">
                            <div class="col-2"><label className="form-label">Filter by name:</label></div>
                                <div class="col-6">
                                    
                                    <input type="text" name="namefilter" value={nameFilter} onChange={handleNameChange} className="form-control" />
                                </div>
                        </div>

                    </div>
                    <div>* indicates clean solve on all puzzles</div>
                    <Styles>
                    <div {...getTableProps()} className="table">
                        <div>
                            {headerGroups.map(headerGroup => (
                                <div {...headerGroup.getHeaderGroupProps()} className="tr">
                                    {headerGroup.headers.map(column => (
                                        <div {...column.getHeaderProps()} className="th">
                                            {column.render('Header')}
                                            {
                                                <div 
                                                    {...column.getResizerProps()}
                                                    className="resizer"
                                                >
                                                </div>
                                            }
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div {...getTableBodyProps()}>
                            <FixedSizeList
                                height={500}
                                itemCount={rows.length}
                                itemSize={35}
                                width={totalColumnsWidth + scrollBarSize}
                            >
                                {RenderRow}
                            </FixedSizeList>
                        </div>
                    </div>
                    </Styles>
                    
                    {data && data.length && divFilter &&
                    <PuzzleStatistics event={event.Title} puzzle={event.puzzles[0].Sequence} solves={
                            data.filter(v => {
                                return v.division === divFilter && v.solves["" + event.puzzles[0].id];
                            }).map(v => {
                                return v.solves["" + event.puzzles[0].id];
                            })
                        }></PuzzleStatistics>
                                         
                    }
                    
                </div>
                

            }
            {
                !event && <h3>loading</h3>
            }
        </div>


    )
}

export default Leaderboard;