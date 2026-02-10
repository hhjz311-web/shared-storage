import React, { useState } from 'react';
import { FormData, Channel, Tone, GenerationResult, GeminiError, DesignStyle, BackgroundStyle, DecorativeStyle, DecorativeDensity, TextBlockPosition, TextBlockSize, ModelUsage } from './types';
import InputForm from './components/InputForm';
import ResultDisplay from './components/ResultDisplay';
import { generateCreativePrompt, generateCreativeImage } from './services/geminiService';
import { CHANNEL_OPTIONS } from './constants';
import { Palette } from 'lucide-react';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    targetAudience: '',
    channel: Channel.SHOPPING_THUMBNAIL,
    tone: Tone.CLEAN,
    additionalInfo: '',
    productImages: [],
    productSizes: [],
    modelImage: undefined,
    modelUsageRule: ModelUsage.USE_MODEL,
    backgroundImage: undefined,
    referenceImage: undefined,
    // New Fields Initialization
    designStyle: DesignStyle.PREMIUM,
    backgroundStyle: BackgroundStyle.SOFT_GRADIENT,
    primaryColor: '#ffffff',
    secondaryColor: '#f0f0f0',
    useDecorativeElements: false,
    decorativeStyle: DecorativeStyle.MINIMAL,
    decorativeDensity: DecorativeDensity.LOW,
    textBlockMainPosition: TextBlockPosition.CENTER,
    textBlockMainSize: TextBlockSize.MEDIUM,
    modificationRequest: '',
  });

  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<GeminiError | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const promptText = await generateCreativePrompt(formData);
      
      let aspectRatioLabel = '1:1';
      if (formData.channel === Channel.NAVER_GFA_CUSTOM && formData.customRatioWidth && formData.customRatioHeight) {
        aspectRatioLabel = `${formData.customRatioWidth}:${formData.customRatioHeight}`;
      } else {
        const channelInfo = CHANNEL_OPTIONS.find(c => c.value === formData.channel);
        aspectRatioLabel = channelInfo ? channelInfo.aspectRatio : '1:1';
      }

      const imageUrl = await generateCreativeImage(
        promptText, 
        formData.channel, 
        formData.productImages,
        formData.modelImage
      );

      setResult({
        prompt: promptText,
        imageUrl,
        aspectRatioLabel
      });

    } catch (err: any) {
      setError({ message: err.message || "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">요술 공장 지니</h1>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">AI Ad Creative Designer</span>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Powered by Google Gemini 2.5
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
          <div className="lg:col-span-4 h-full">
            <InputForm 
              formData={formData} 
              setFormData={setFormData} 
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-8 h-full">
            <ResultDisplay result={result} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;