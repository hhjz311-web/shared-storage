
import React, { useRef } from 'react';
import { FormData, Channel, Tone, DesignStyle, BackgroundStyle, DecorativeStyle, DecorativeDensity, TextBlockPosition, TextBlockSize, ModelUsage } from '../types';
import { 
  CHANNEL_OPTIONS, TONE_OPTIONS, SAMPLE_PRODUCTS, PRODUCT_SIZE_OPTIONS,
  DESIGN_STYLE_OPTIONS, BACKGROUND_STYLE_OPTIONS, DECORATIVE_STYLE_OPTIONS, 
  DECORATIVE_DENSITY_OPTIONS, TEXT_BLOCK_POSITION_OPTIONS, TEXT_BLOCK_SIZE_OPTIONS,
  MODEL_USAGE_OPTIONS
} from '../constants';
import { Wand2, Loader2, Upload, X, Plus, LayoutTemplate, Palette, Type, Image as ImageIcon, MessageSquarePlus } from 'lucide-react';

interface InputFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ formData, setFormData, onSubmit, isLoading }) => {
  const productInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSampleClick = (sample: string) => {
    setFormData(prev => ({ ...prev, productName: sample }));
  };

  // Handle single file uploads
  const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'modelImage' | 'backgroundImage' | 'referenceImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle multiple product image uploads
  const handleProductFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const remainingSlots = 10 - formData.productImages.length;
      if (remainingSlots <= 0) {
        alert("최대 10개까지 업로드 가능합니다.");
        return;
      }
      
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      filesToProcess.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setFormData(prev => ({
              ...prev,
              productImages: [...prev.productImages, reader.result as string],
              productSizes: [...(prev.productSizes || []), 'Medium']
            }));
          }
        };
        reader.readAsDataURL(file);
      });
      
      if (productInputRef.current) productInputRef.current.value = '';
    }
  };

  const removeProductImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
      productSizes: (prev.productSizes || []).filter((_, i) => i !== index)
    }));
  };

  const updateProductSize = (index: number, newSize: string) => {
    setFormData(prev => {
      const newSizes = [...(prev.productSizes || [])];
      while (newSizes.length <= index) newSizes.push('Medium');
      newSizes[index] = newSize;
      return { ...prev, productSizes: newSizes };
    });
  };

  const removeSingleImage = (field: 'modelImage' | 'backgroundImage' | 'referenceImage') => {
    setFormData(prev => ({ ...prev, [field]: undefined }));
    if (field === 'modelImage' && modelInputRef.current) modelInputRef.current.value = '';
    if (field === 'backgroundImage' && bgInputRef.current) bgInputRef.current.value = '';
    if (field === 'referenceImage' && refInputRef.current) refInputRef.current.value = '';
  };

  const renderProductImageUpload = () => {
    const hasImages = formData.productImages.length > 0;
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          제품 이미지 <span className="text-slate-400 font-normal ml-1 text-xs">(필수, 역할 지정)</span>
        </label>
        
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {formData.productImages.map((img, idx) => {
            const currentSize = (formData.productSizes && formData.productSizes[idx]) || 'Medium';
            return (
              <div key={idx} className="relative group flex flex-col gap-1">
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-square">
                  <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover"/>
                  <div className="absolute top-1 left-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                    #{idx + 1}
                  </div>
                  <button onClick={() => removeProductImage(idx)} className="absolute top-1 right-1 p-0.5 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-sm z-10">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <select 
                  value={currentSize}
                  onChange={(e) => updateProductSize(idx, e.target.value)}
                  className="w-full text-[10px] px-1 py-1 rounded border border-slate-200 bg-white text-slate-700 outline-none focus:border-indigo-400"
                >
                  {PRODUCT_SIZE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            );
          })}
          {formData.productImages.length < 10 && (
            <div onClick={() => productInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-lg aspect-square hover:border-indigo-400 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[80px]">
              <Plus className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] text-slate-500">추가</span>
              <input type="file" ref={productInputRef} className="hidden" accept="image/*" multiple onChange={handleProductFilesChange} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSingleImageUpload = (label: string, field: 'modelImage' | 'backgroundImage' | 'referenceImage', inputRef: React.RefObject<HTMLInputElement | null>) => {
    const hasImage = !!formData[field];
    return (
      <div className="flex flex-col h-full">
        <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
        {!hasImage ? (
          <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-lg p-2 hover:border-indigo-400 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center flex-grow min-h-[80px]">
            <Upload className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] text-slate-500 mt-1">업로드</span>
            <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={(e) => handleSingleFileChange(e, field)} />
          </div>
        ) : (
          <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex-grow min-h-[80px]">
            <img src={formData[field]} alt="preview" className="w-full h-full object-cover absolute inset-0" />
            <button onClick={() => removeSingleImage(field)} className="absolute top-1 right-1 p-0.5 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-sm z-10">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 h-full flex flex-col">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-indigo-600" />
          Creative Setup
        </h2>
      </div>

      <div className="space-y-8 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        
        {/* 1. 이미지 업로드 섹션 */}
        <section>
           {renderProductImageUpload()}
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
             {/* 모델 이미지 & 설정 */}
             <div>
               <div className="flex items-center justify-between mb-1">
                 <label className="text-sm font-medium text-slate-700">모델 이미지</label>
               </div>
               <div className="flex gap-3 h-24">
                  <div className="w-24 flex-shrink-0">
                    {renderSingleImageUpload("", "modelImage", modelInputRef)}
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <label className="text-xs text-slate-500 mb-1">모델 사용 규칙</label>
                    <select
                      value={formData.modelUsageRule}
                      onChange={(e) => handleChange('modelUsageRule', e.target.value)}
                      className="w-full text-xs px-2 py-2 rounded border border-slate-200 bg-white"
                      disabled={!formData.modelImage}
                    >
                      {MODEL_USAGE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
               </div>
             </div>

             {/* 배경 & 레퍼런스 */}
             <div className="grid grid-cols-2 gap-3">
                {renderSingleImageUpload("배경 참고", "backgroundImage", bgInputRef)}
                {renderSingleImageUpload("레퍼런스", "referenceImage", refInputRef)}
             </div>
           </div>
        </section>

        {/* 2. 채널 및 사이즈 */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-indigo-500" /> 채널 및 규격
          </h3>
          <div>
            <select
              value={formData.channel}
              onChange={(e) => handleChange('channel', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 bg-white text-sm"
            >
              {CHANNEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          {formData.channel === Channel.NAVER_GFA_CUSTOM && (
            <div className="grid grid-cols-2 gap-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <div>
                <label className="block text-xs font-medium text-yellow-800 mb-1">가로 (px)</label>
                <input
                  type="number"
                  value={formData.customRatioWidth || ''}
                  onChange={(e) => handleChange('customRatioWidth', Number(e.target.value))}
                  placeholder="예: 1200"
                  className="w-full px-2 py-1.5 text-sm border border-yellow-200 rounded focus:border-yellow-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-yellow-800 mb-1">세로 (px)</label>
                <input
                  type="number"
                  value={formData.customRatioHeight || ''}
                  onChange={(e) => handleChange('customRatioHeight', Number(e.target.value))}
                  placeholder="예: 628"
                  className="w-full px-2 py-1.5 text-sm border border-yellow-200 rounded focus:border-yellow-500 outline-none"
                />
              </div>
              <p className="col-span-2 text-[10px] text-yellow-700 mt-1">* 입력한 사이즈는 비율(Aspect Ratio)로 변환되어 적용됩니다.</p>
            </div>
          )}
        </section>

        {/* 3. 디자인 스타일 */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-500" /> 디자인 스타일
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">전체 무드 (Mood)</label>
              <select
                value={formData.designStyle}
                onChange={(e) => handleChange('designStyle', e.target.value)}
                className="w-full px-2 py-2 text-sm rounded border border-slate-200"
              >
                {DESIGN_STYLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
               <label className="block text-xs font-medium text-slate-600 mb-1">분위기 (Tone)</label>
               <select
                value={formData.tone}
                onChange={(e) => handleChange('tone', e.target.value)}
                className="w-full px-2 py-2 text-sm rounded border border-slate-200"
              >
                {TONE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
             <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">배경 스타일</label>
                <select
                  value={formData.backgroundStyle}
                  onChange={(e) => handleChange('backgroundStyle', e.target.value)}
                  className="text-xs border border-slate-200 rounded px-2 py-1 w-1/2"
                >
                  {BACKGROUND_STYLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="block text-[10px] text-slate-500 mb-1">Primary Color</label>
                   <div className="flex items-center gap-2">
                     <input type="color" value={formData.primaryColor} onChange={(e) => handleChange('primaryColor', e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0" />
                     <input type="text" value={formData.primaryColor} onChange={(e) => handleChange('primaryColor', e.target.value)} className="w-full text-xs border-b border-slate-200 bg-transparent py-1 outline-none font-mono" />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] text-slate-500 mb-1">Secondary Color</label>
                   <div className="flex items-center gap-2">
                     <input type="color" value={formData.secondaryColor} onChange={(e) => handleChange('secondaryColor', e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0" />
                     <input type="text" value={formData.secondaryColor} onChange={(e) => handleChange('secondaryColor', e.target.value)} className="w-full text-xs border-b border-slate-200 bg-transparent py-1 outline-none font-mono" />
                   </div>
                </div>
             </div>
          </div>

          {/* Decorations */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
             <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">장식 요소 (Decorations)</label>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-slate-500">사용함</span>
                   <input 
                    type="checkbox" 
                    checked={formData.useDecorativeElements}
                    onChange={(e) => handleChange('useDecorativeElements', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                   />
                </div>
             </div>
             {formData.useDecorativeElements && (
               <div className="grid grid-cols-2 gap-3 mt-2">
                 <select value={formData.decorativeStyle} onChange={(e) => handleChange('decorativeStyle', e.target.value)} className="text-xs border border-slate-200 rounded px-2 py-1">
                    {DECORATIVE_STYLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                 </select>
                 <select value={formData.decorativeDensity} onChange={(e) => handleChange('decorativeDensity', e.target.value)} className="text-xs border border-slate-200 rounded px-2 py-1">
                    {DECORATIVE_DENSITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                 </select>
               </div>
             )}
          </div>
        </section>

        {/* 4. 텍스트 공간 & 제품 정보 */}
        <section className="space-y-4">
           <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Type className="w-4 h-4 text-green-600" /> 텍스트 공간 및 정보
          </h3>
          <div className="grid grid-cols-2 gap-3">
             <div>
               <label className="block text-xs font-medium text-slate-600 mb-1">메인 텍스트 위치</label>
               <select value={formData.textBlockMainPosition} onChange={(e) => handleChange('textBlockMainPosition', e.target.value)} className="w-full text-xs px-2 py-2 rounded border border-slate-200">
                 {TEXT_BLOCK_POSITION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-xs font-medium text-slate-600 mb-1">공간 크기</label>
               <select value={formData.textBlockMainSize} onChange={(e) => handleChange('textBlockMainSize', e.target.value)} className="w-full text-xs px-2 py-2 rounded border border-slate-200">
                 {TEXT_BLOCK_SIZE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
               </select>
             </div>
          </div>
          
          <div className="pt-2 border-t border-slate-100 mt-2">
             <label className="block text-sm font-medium text-slate-700 mb-1">제품 정보 입력</label>
             <input type="text" value={formData.productName} onChange={(e) => handleChange('productName', e.target.value)} placeholder="제품명 (필수)" className="w-full px-3 py-2 mb-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
             <input type="text" value={formData.additionalInfo} onChange={(e) => handleChange('additionalInfo', e.target.value)} placeholder="주요 특징/소구점 (선택)" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none" />
          </div>
        </section>

        {/* 5. 수정 요청 (New) */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-orange-500" /> 수정 요청 / 추가 지시사항
          </h3>
          <textarea
            value={formData.modificationRequest}
            onChange={(e) => handleChange('modificationRequest', e.target.value)}
            placeholder="예: 배경을 조금 더 밝게 해주고, 제품 그림자를 부드럽게 처리해주세요."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none h-20 resize-none"
          />
        </section>
      </div>

      <div className="pt-4 mt-2 border-t border-slate-100">
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className={`w-full py-3.5 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 ${
            isLoading 
              ? 'bg-indigo-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300 transform active:scale-[0.98]'
          }`}
        >
          {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>생성 중...</span></> : <><Wand2 className="w-5 h-5" /><span>광고 소재 생성하기</span></>}
        </button>
      </div>
    </div>
  );
};

export default InputForm;
