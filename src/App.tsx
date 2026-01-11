import { WritingMode } from './components/WritingMode';

function App() {
  const handleChange = (text: string) => {
    console.log('入力中:', text);
  };

  const handleComplete = (text: string) => {
    console.log('書き出し完了:', text);
  };

  return (
    <div className="app">
      <h1>瞬発思考</h1>
      <WritingMode
        autoStart={true}
        onChange={handleChange}
        onComplete={handleComplete}
      />
    </div>
  );
}

export default App;
