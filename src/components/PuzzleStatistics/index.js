//import userEvent from '@testing-library/user-event';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import _ from 'lodash';
import styled from 'styled-components';
import {Boxplot} from 'react-boxplot';

const Styles = styled.div`
        font-family: Spinnaker, sans-serif;
        text-align: center;

        .statsContainer {
            padding: 1rem;
            display: flex;
            flex-direction: row-reverse;
            justify-content: center;
            flex-wrap: wrap;
        }

        .puzzleStats {
            text-align: center;
            h3 {
                font-size: 1.3rem;
            }
            p {
                line-height: .8rem;
            }

            width: 175px;
            padding: 10px;
            flex-shrink: 0;
        }

        .boxplot {
            svg {
                fill: blue;
            }
            border-bottom: dashed 1px #cecece;
            padding: 2px 0;
        }
    `;
     

const tfmt = function(secs){

    function pad(x){
        return x.toString().padStart(2, '0');
    }

    secs = Math.round(secs);
    let rem = 0;
    //let hrs = Math.floor(secs / 3600);
    rem = secs % 3600;
    let mins = Math.floor(rem / 60);
    rem = rem % 60;
    secs = rem % 60;
    return `${mins}:${pad(secs)}`;
}

let solves;

function PuzzleStatistics(props){

    let { puzzleid } = useParams();
    
    //const [solves, setSolves] = useState();
    const [selectedDivision, setSelectedDvision] = useState('Stormy');
    const [entryType] = useState('All');
    const [cleanOnly] = useState(true);
    const [statistics, setStatistics] = useState({});
    
    let colors = [
        '#B6D47E',
        '#EB8DC5',
        '#F2D761',
        '#8FD9E3',
        '#A8A8A8'
    ]
    const handleDivChange = (e) => {
        setSelectedDvision(e.target.value);
        prepStats(e.target.value);
    }
 
    const prepStats = useCallback(() => {
        //filter by division
        let stats = _.groupBy(solves.filter(v => {
            return v.division === selectedDivision;
        }), (s) => {
            return `Puzzle #${s.sequence}`
        });//'title');
         
        //for each puzzle, do the math and create a data series

        let temp ={};

        for (let x in stats){
            let s = (stats[x]).filter(v => {
                return (cleanOnly ? v.clean : true) &&
                (entryType === 'All' ? true : v.entryType === entryType) &&
                v.time < 20 * 60;
            }).sort((a, b) => {
                return a.time - b.time;
            });
            temp[x] = {
                mean: s.reduce((prev, cur) => {
                    return prev + cur.time;
                }, 0) / s.length,
                median: s[Math.ceil(s.length / 2) - 1].time,
                q1: s[Math.ceil(s.length * .25) - 1].time,
                q3: s[Math.ceil(s.length * .75) - 1].time,
                min: s[0].time,
                max: s[s.length - 1].time,
                solveCount: s.length
            }
        }
        
        setStatistics(temp);

    }, [selectedDivision, cleanOnly, entryType]);

    useEffect(() => {
        //get the data
        axios.get(`https://4chbxgj610.execute-api.us-east-1.amazonaws.com/dev/solve-data/${puzzleid}`)
            .then(res => {
                solves = res.data;
                prepStats();
            })
    }, [puzzleid, prepStats]);

   

    function StatsList(props){
        const stats = props.stats;
        let outs = [];
        if (Object.keys(stats).length){
            Object.keys(stats).sort().forEach((v, i) => {
                outs.push(<div className="puzzleStats" key={i}>
                <h3>{v}</h3>
                <p>Solves: {stats[v].solveCount}</p>
                <p>Mean: {tfmt(stats[v].mean)}</p>
                <p>Median: {tfmt(stats[v].median)}</p>
                <p>Best: {tfmt(stats[v].min)}</p>
                <div className="boxplot">
                    <Boxplot width={155}
                        height={25}
                        orientation="horizontal"
                        min={0}
                        max={20 * 60}
                        stats={
                            {
                                whiskerLow: stats[v].min,
                                whiskerHigh: stats[v].max,
                                quartile1: stats[v].q1,
                                quartile2: stats[v].median,
                                quartile3: stats[v].q3,
                                outliers: []
                            }
                        }
                        boxStyle={{fill: colors[i]}}
                        tickStyle={{stroke: colors[i]}}
                        whiskerStyle={{stroke: colors[i]}}
                    />
                </div>
            </div>)    
            });
        };
        return <div className="statsContainer">
            {outs}
        </div>
    }

    return (
        <Styles>
            <h1>Boswords Fall '21 League</h1>
            <h2>Solve Statistics</h2>
            <p>Data below include all clean solves completed within the 20-minute time limit.</p>
            <p>If you'd like to do your own analysis you can download the raw data in CSV format <a href={`https://4chbxgj610.execute-api.us-east-1.amazonaws.com/dev/solve-data/csv/${puzzleid}`}>here</a>.</p>
            <div className="btn-group" role="group" aria-label="Division Selector">
                <input type="radio" className="btn-check" name="btnradio" id="btnradio1" value="Stormy" checked={selectedDivision === 'Stormy'} onChange={handleDivChange} autoComplete="off" />
                <label className="btn btn-outline-dark" htmlFor="btnradio1">Stormy</label>

                <input type="radio" className="btn-check" name="btnradio" id="btnradio2" value="Choppy" checked={selectedDivision === 'Choppy'} onChange={handleDivChange} autoComplete="off" />
                <label className="btn btn-outline-dark" htmlFor="btnradio2">Choppy</label>

                <input type="radio" className="btn-check" name="btnradio" id="btnradio3" value="Smooth" checked={selectedDivision === 'Smooth'} onChange={handleDivChange} autoComplete="off" />
                <label className="btn btn-outline-dark" htmlFor="btnradio3">Smooth</label>
            </div>
            {!statistics && <p>Hang on</p>}
            {statistics &&
                <div>
                    <StatsList stats={statistics} />
                </div>
            }
        </Styles>        
    )
}


export default PuzzleStatistics;