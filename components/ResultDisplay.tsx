import React from 'react';
import { GenerationResult } from '../types';
import { Copy, Check, Download, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ResultDisplayProps {
  result: GenerationResult | null;
  isLoading: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (result?.prompt) {
      navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (result?.imageUrl) {
      const link = document.createElement('a');
      link.href = result.imageUrl;
      link.download = `creative-flow-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-8 text-center animate-pulse">
        <div className="bg-indigo-100 p-4 rounded-full mb-4">
          <Sparkles className="w-10 h-10 text-indigo-600 animate-spin-slow" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">AI가 디자인 중입니다...</h3>
        <p className="text-slate-500 max-w-sm">
          제품의 매력을 극대화할 수 있는 프롬프트를 작성하고<br/>
          고퀄리티 이미지를 생성하고 있습니다.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
          <ImageIcon className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-400">결과가 여기에 표시됩니다</h3>
        <p className="text-slate-400 text-sm mt-1">왼쪽 패널에서 정보를 입력하고 생성 버튼을 눌러주세요.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      
      {/* Generated Image Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            Generated Preview
          </h3>
          <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
            {result.aspectRatioLabel}
          </span>
        </div>
        
        <div className="relative group min-h-[300px] flex items-center justify-center bg-slate-100">
          {result.imageUrl ? (
            <>
              <img 
                src={result.imageUrl} 
                alt="Generated Creative" 
                className="w-full h-auto object-contain max-h-[600px]" 
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={handleDownload}
                  className="bg-white/90 hover:bg-white text-slate-800 p-2 rounded-lg shadow-lg backdrop-blur-sm border border-slate-200 transition-all transform hover:scale-105"
                  title="Download Image"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-slate-400 text-sm">이미지 생성에 실패했습니다.</div>
          )}
        </div>
      </div>

      {/* Prompt Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-grow">
        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Generated Prompt (English)
          </h3>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              copied 
                ? 'bg-green-100 text-green-700' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Text
              </>
            )}
          </button>
        </div>
        <div className="p-6">
          <p className="text-slate-700 leading-relaxed font-mono text-sm whitespace-pre-wrap">
            {result.prompt}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            Optimized for Gemini & Imagen Models
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;