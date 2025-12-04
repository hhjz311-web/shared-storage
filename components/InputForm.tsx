import React, { useRef } from 'react';
import { FormData, Channel, Tone, TextPosition } from '../types';
import { CHANNEL_OPTIONS, TONE_OPTIONS, SAMPLE_PRODUCTS, PRODUCT_SIZE_OPTIONS, TEXT_POSITION_OPTIONS } from '../constants';
import { Wand2, Loader2, Upload, X, Plus, Type, LayoutTemplate } from 'lucide-react';

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
  
  const handleChange = (field: keyof FormData, value: string | any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSampleClick = (sample: string) => {
    setFormData(prev => ({ ...prev, productName: sample }));
  };

  // Handle single file uploads (Model, Background, Reference)
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
      // Limit to max 10 images total
      const remainingSlots = 10 - formData.productImages.length;
      if (remainingSlots <= 0) {
        alert("최대 10개까지 업로드 가능합니다.");
        return;
      }
      
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      // Explicitly type file as File
      filesToProcess.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setFormData(prev => ({
              ...prev,
              productImages: [...prev.productImages, reader.result as string],
              // Default new images to 'Medium' size
              productSizes: [...(prev.productSizes || []), 'Medium']
            }));
          }
        };
        reader.readAsDataURL(file);
      });
      
      // Reset input
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
      // Ensure array is populated enough
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

  // Helper to render the product images section (Multiple)
  const renderProductImageUpload = () => {
    const hasImages = formData.productImages.length > 0;

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          제품 이미지 <span className="text-slate-400 font-normal ml-1 text-xs">(필수, 최대 10장)</span>
        </label>
        
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {formData.productImages.map((img, idx) => {
            const currentSize = (formData.productSizes && formData.productSizes[idx]) || 'Medium';
            return (
              <div key={idx} className="relative group flex flex-col gap-1">
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-square">
                  <img 
                    src={img} 
                    alt={`Product ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  {/* Number Badge */}
                  <div className="absolute top-1 left-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                    #{idx + 1}
                  </div>

                  <button
                    onClick={() => removeProductImage(idx)}
                    className="absolute top-1 right-1 p-0.5 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-sm z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                {/* Size Selector */}
                <select 
                  value={currentSize}
                  onChange={(e) => updateProductSize(idx, e.target.value)}
                  className="w-full text-[10px] px-1 py-1 rounded border border-slate-200 bg-white text-slate-700 outline-none focus:border-indigo-400"
                >
                  {PRODUCT_SIZE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}

          {/* Add Button */}
          {formData.productImages.length < 10 && (
            <div 
              onClick={() => productInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-lg aspect-square hover:border-indigo-400 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[80px]"
            >
              <Plus className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] text-slate-500">추가</span>
              <input 
                type="file" 
                ref={productInputRef}
                className="hidden" 
                accept="image/*"
                multiple
                onChange={handleProductFilesChange}
              />
            </div>
          )}
        </div>
        {!hasImages ? (
           <p className="text-xs text-slate-400 mt-1">제품 이미지를 1장 이상 업로드하면 AI가 형태를 인식합니다.</p>
        ) : (
           <p className="text-xs text-indigo-500 mt-1 font-medium">드롭다운에서 제품의 크기(비중)를 선택하세요.</p>
        )}
      </div>
    );
  };

  // Helper for single image uploads
  const renderSingleImageUpload = (
    label: string, 
    field: 'modelImage' | 'backgroundImage' | 'referenceImage', 
    inputRef: React.RefObject<HTMLInputElement | null>,
    required: boolean = false
  ) => {
    const hasImage = !!formData[field];

    return (
      <div className="mb-4 h-full flex flex-col">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {!hasImage ? (
          <div 
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-lg p-3 hover:border-indigo-400 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 flex-grow min-h-[96px]"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] text-slate-500">업로드</span>
            <input 
              type="file" 
              ref={inputRef}
              className="hidden" 
              accept="image/*"
              onChange={(e) => handleSingleFileChange(e, field)}
            />
          </div>
        ) : (
          <div className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex-grow min-h-[96px]">
            <img 
              src={formData[field]} 
              alt="Upload preview" 
              className="w-full h-full object-cover absolute inset-0"
            />
            <button
              onClick={() => removeSingleImage(field)}
              className="absolute top-1 right-1 p-0.5 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-sm z-10"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-indigo-600" />
          Creative Setup
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          제품 이미지와 모델/배경 이미지를 합성하여 자연스러운 광고를 생성합니다.
        </p>
      </div>

      <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Image Uploads Section */}
        <div>
           {renderProductImageUpload()}
           <div className="grid grid-cols-3 gap-3">
             <div className="flex flex-col">{renderSingleImageUpload("모델 이미지", "modelImage", modelInputRef)}</div>
             <div className="flex flex-col">{renderSingleImageUpload("배경 참고", "backgroundImage", bgInputRef)}</div>
             <div className="flex flex-col">{renderSingleImageUpload("레퍼런스", "referenceImage", refInputRef)}</div>
           </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1">
            <LayoutTemplate className="w-4 h-4" /> 기본 정보
          </h3>
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">제품명 / 서비스명</label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => handleChange('productName', e.target.value)}
              placeholder="예: 퓨어 비타민 C 앰플"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
            {!formData.productName && (
              <div className="mt-2 flex flex-wrap gap-2">
                {SAMPLE_PRODUCTS.map((sample) => (
                  <button
                    key={sample}
                    onClick={() => handleSampleClick(sample)}
                    className="text-xs bg-slate-50 text-slate-600 px-3 py-1 rounded-full hover:bg-slate-100 border border-slate-100 transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Channel Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">광고 채널</label>
            <div className="grid grid-cols-1 gap-2">
              {CHANNEL_OPTIONS.map((option) => (
                <label 
                  key={option.value}
                  className={`relative flex items-center px-4 py-2.5 border rounded-lg cursor-pointer transition-all ${
                    formData.channel === option.value 
                      ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="channel"
                    value={option.value}
                    checked={formData.channel === option.value}
                    onChange={(e) => handleChange('channel', e.target.value as any)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-3 block text-sm font-medium text-slate-700">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Custom GFA Dimensions */}
            {formData.channel === Channel.NAVER_GFA_CUSTOM && (
              <div className="grid grid-cols-2 gap-3 mt-2 pl-2 border-l-2 border-indigo-100">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">가로 (px)</label>
                  <input
                    type="number"
                    value={formData.gfaCustomWidth || ''}
                    onChange={(e) => handleChange('gfaCustomWidth', e.target.value)}
                    placeholder="예: 600"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">세로 (px)</label>
                  <input
                    type="number"
                    value={formData.gfaCustomHeight || ''}
                    onChange={(e) => handleChange('gfaCustomHeight', e.target.value)}
                    placeholder="예: 335"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tone & Target */}
          <div className="grid grid-cols-2 gap-3">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">분위기</label>
              <select
                value={formData.tone}
                onChange={(e) => handleChange('tone', e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none bg-white text-sm"
              >
                {TONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">타겟 (선택)</label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => handleChange('targetAudience', e.target.value)}
                placeholder="예: 2030 직장인"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Text Overlay Section */}
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1">
            <Type className="w-4 h-4" /> 텍스트 오버레이 설정
          </h3>
          
          {/* Headline */}
          <div className="grid grid-cols-12 gap-2 items-start">
             <div className="col-span-8">
               <label className="block text-xs font-medium text-slate-500 mb-1">메인 카피 (Headline)</label>
               <input
                 type="text"
                 value={formData.headlineText || ''}
                 onChange={(e) => handleChange('headlineText', e.target.value)}
                 placeholder="강력한 한 줄 문구"
                 className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
               />
             </div>
             <div className="col-span-4">
               <label className="block text-xs font-medium text-slate-500 mb-1">위치</label>
               <select
                 value={formData.headlinePosition || 'top-center'}
                 onChange={(e) => handleChange('headlinePosition', e.target.value)}
                 className="w-full px-2 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none bg-white"
               >
                 {TEXT_POSITION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
               </select>
             </div>
          </div>

          {/* Sub Text */}
          <div className="grid grid-cols-12 gap-2 items-start">
             <div className="col-span-8">
               <label className="block text-xs font-medium text-slate-500 mb-1">보조 카피 (Sub Text)</label>
               <input
                 type="text"
                 value={formData.subText || ''}
                 onChange={(e) => handleChange('subText', e.target.value)}
                 placeholder="제품 설명 또는 혜택"
                 className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
               />
             </div>
             <div className="col-span-4">
               <label className="block text-xs font-medium text-slate-500 mb-1">위치</label>
               <select
                 value={formData.subPosition || 'center'}
                 onChange={(e) => handleChange('subPosition', e.target.value)}
                 className="w-full px-2 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none bg-white"
               >
                 {TEXT_POSITION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
               </select>
             </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-12 gap-2 items-start">
             <div className="col-span-8">
               <label className="block text-xs font-medium text-slate-500 mb-1">CTA (버튼)</label>
               <input
                 type="text"
                 value={formData.ctaText || ''}
                 onChange={(e) => handleChange('ctaText', e.target.value)}
                 placeholder="예: 구매하기, 자세히 보기"
                 className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
               />
             </div>
             <div className="col-span-4">
               <label className="block text-xs font-medium text-slate-500 mb-1">위치</label>
               <select
                 value={formData.ctaPosition || 'bottom-center'}
                 onChange={(e) => handleChange('ctaPosition', e.target.value)}
                 className="w-full px-2 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 outline-none bg-white"
               >
                 {TEXT_POSITION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
               </select>
             </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="border-t border-slate-100 pt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">추가 요청사항</label>
          <textarea
            value={formData.additionalInfo}
            onChange={(e) => handleChange('additionalInfo', e.target.value)}
            placeholder="예: 제품 #1을 중앙에 두고, 제품 #2는 뒤쪽에 배치해주세요."
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none text-sm"
          />
        </div>
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
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>생성 중...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>광고 소재 생성하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputForm;