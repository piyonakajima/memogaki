import { Timer } from './components/Timer';

function App() {
  const handleTimerComplete = () => {
    console.log('タイマー終了！');
  };

  return (
    <div className="app">
      <h1>瞬発思考</h1>
      <Timer onComplete={handleTimerComplete} />
    </div>
  );
}

export default App;
