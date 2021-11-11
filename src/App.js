import './App.css';
import Leaderboard from './components/Leaderboard';
import PuzzleStatistics from './components/PuzzleStatistics';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import 'react-app-polyfill/ie11';
import GA from 'react-ga';

function App() {

  GA.initialize('G-HW58MYN8L7');
  
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/:puzzleid/stats">
            <PuzzleStatistics />
          </Route>
          <Route path="/:eventid">
            <Leaderboard />
          </Route>
          <Route path="/">
          <Leaderboard />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
