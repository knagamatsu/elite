import React, { useState, useEffect } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { HomeIcon, BarChartIcon, NewspaperIcon, CogIcon } from 'lucide-react';

const ELITE = () => {
  const [chart, setChart] = useState(null);
  const [pnlData, setPnlData] = useState([]);
  const [botLogic, setBotLogic] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const [selectedLanguage, setSelectedLanguage] = useState('pine');

  useEffect(() => {
    if (activeTab === 'editor') {
      const chartOptions = {
        layout: {
          textColor: 'black',
          background: { type: ColorType.Solid, color: 'white' },
        },
      };
      const newChart = createChart(document.getElementById('chart'), chartOptions);
      const candleSeries = newChart.addCandlestickSeries();
      
      const data = generateOHLCData(30);
      candleSeries.setData(data);
      setChart(newChart);

      setPnlData(generatePNLData(data));

      return () => {
        newChart.remove();
      };
    }
  }, [activeTab]);

  const generateOHLCData = (days) => {
    const data = [];
    let currentPrice = 100;
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const open = currentPrice + (Math.random() - 0.5) * 3;
      const high = open + Math.random() * 2;
      const low = open - Math.random() * 2;
      const close = (open + high + low) / 3;
      data.push({
        time: date.toISOString().split('T')[0],
        open,
        high,
        low,
        close,
      });
      currentPrice = close;
    }
    return data;
  };

  const generatePNLData = (ohlcData) => {
    let cumulativePNL = 0;
    return ohlcData.map((data, index) => {
      const pnlChange = (Math.random() - 0.45) * 1000;
      cumulativePNL += pnlChange;
      return {
        name: data.time,
        pnl: Math.round(cumulativePNL),
      };
    });
  };

  const handleBotLogicChange = (e) => {
    setBotLogic(e.target.value);
  };

  const handleScriptChange = (e) => {
    setGeneratedScript(e.target.value);
  };

  const handleDeploy = () => {
    console.log('Deploying script:', generatedScript);
  };

  const handleGenerateScript = () => {
    // ここにスクリプト生成ロジックを実装
    console.log('Generating script from:', botLogic);
    setGeneratedScript('// Generated script will appear here');
  };

  const renderEditor = () => (
    <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full">
      <div className="border rounded-lg p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-2">OHLCチャート</h2>
        <div id="chart" className="flex-1"></div>
      </div>
      <div className="border rounded-lg p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-2">ボットロジック（自然言語）</h2>
        <Textarea
          value={botLogic}
          onChange={handleBotLogicChange}
          placeholder="ここに自然言語でボットロジックを入力してください"
          className="flex-1 resize-none mb-2"
        />
        <div className="flex justify-between items-center">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="言語を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pine">Pine Script</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateScript}>スクリプト生成</Button>
        </div>
      </div>
      <div className="border rounded-lg p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-2">累積損益チャート</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={pnlData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pnl" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="border rounded-lg p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-2">生成されたスクリプト ({selectedLanguage})</h2>
        <Textarea
          value={generatedScript}
          onChange={handleScriptChange}
          placeholder={`ここに生成された${selectedLanguage === 'pine' ? 'Pine Script' : 'Python'}が表示されます`}
          className="flex-1 resize-none mb-2"
        />
        <div className="flex justify-between">
          <Button onClick={() => console.log('PNL output')}>損益グラフ出力</Button>
          <Button onClick={handleDeploy}>デプロイ</Button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="flex-1 p-4">
      <h2 className="text-2xl font-bold mb-4">ダッシュボード</h2>
      <p>ここにダッシュボードの内容を追加します。</p>
    </div>
  );

  const renderNews = () => (
    <div className="flex-1 p-4">
      <h2 className="text-2xl font-bold mb-4">ニュース</h2>
      <p>ここにニュースフィードを表示します。</p>
    </div>
  );

  const renderSettings = () => (
    <div className="flex-1 p-4">
      <h2 className="text-2xl font-bold mb-4">設定</h2>
      <p>ここにアプリケーションの設定オプションを表示します。</p>
    </div>
  );

  const navItems = [
    { id: 'dashboard', icon: HomeIcon, label: 'ダッシュボード' },
    { id: 'editor', icon: BarChartIcon, label: 'エディタ' },
    { id: 'news', icon: NewspaperIcon, label: 'ニュース' },
    { id: 'settings', icon: CogIcon, label: '設定' },
  ];

  return (
    <div className="h-screen flex">
      <nav className="w-64 bg-white border-r">
        <div className="p-4">
          <h1 className="text-2xl font-bold">ELITE</h1>
        </div>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`w-full text-left p-2 flex items-center ${activeTab === item.id ? 'bg-gray-100' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="mr-2" size={20} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 overflow-auto p-4">
        {activeTab === 'editor' && renderEditor()}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'news' && renderNews()}
        {activeTab === 'settings' && renderSettings()}
      </main>
    </div>
  );
};

export default ELITE;