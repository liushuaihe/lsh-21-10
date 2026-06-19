import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import TurnControl from "@/pages/TurnControl";
import Poison from "@/pages/Poison";
import TimeMachine from "@/pages/TimeMachine";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/turn-control" element={<TurnControl />} />
          <Route path="/poison" element={<Poison />} />
          <Route path="/timemachine" element={<TimeMachine />} />
        </Route>
      </Routes>
    </Router>
  );
}
