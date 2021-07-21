import './App.css';
import Leaderboard from './components/Leaderboard';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

function App() {
  
  return (
    <Router>
      <div className="App">
        <Switch>
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
