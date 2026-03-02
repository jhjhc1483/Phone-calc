'use client';

import { useState } from 'react';
import { ChevronRight, Smartphone, RefreshCcw, CheckCircle2, Plus, Trash2 } from 'lucide-react';

export default function PhoneCalculator() {
  const [step, setStep] = useState(0);

  // 1. 단말기 기본 정보 & 자급제 할인
  const [phonePrice, setPhonePrice] = useState<number | ''>(1250000);
  const [unlockedDiscount, setUnlockedDiscount] = useState<number | ''>(0);

  // 2. 자급제 통신비 상태
  const [mvnoPlan, setMvnoPlan] = useState<number | ''>(33000);
  const [isUnlockedContract, setIsUnlockedContract] = useState(false); // 자급제 선택약정 여부

  // 3. 통신사 약정 상태
  const [subsidy, setSubsidy] = useState<number | ''>(500000);
  const [highPlan, setHighPlan] = useState<number | ''>(99000);
  const [highPlanMonths, setHighPlanMonths] = useState<number | ''>(6);
  const [normalPlan, setNormalPlan] = useState<number | ''>(55000);
  const [isCarrierContract, setIsCarrierContract] = useState(false); // 통신사 선택약정 여부
  
  // 부가서비스 상태
  const [extraServices, setExtraServices] = useState<{ id: number; price: number | ''; months: number | '' }[]>([]);

  const addExtraService = () => {
    setExtraServices([...extraServices, { id: Date.now(), price: '', months: '' }]);
  };

  const updateExtraService = (id: number, field: 'price' | 'months', value: number) => {
    setExtraServices(extraServices.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeExtraService = (id: number) => {
    setExtraServices(extraServices.filter(s => s.id !== id));
  };

  // 한글 금액 변환 유틸리티
  const formatKorean = (num: number | '') => {
    if (!num) return '';
    const n = Number(num);
    if (n === 0) return '0원';
    
    const man = Math.floor(n / 10000);
    const remainder = n % 10000;
    
    let result = '';
    if (man > 0) result += `${man.toLocaleString()}만`;
    if (remainder > 0) result += ` ${remainder.toLocaleString()}`;
    
    return result.trim() + '원';
  };

  const formatMoney = (amount: number) => amount.toLocaleString() + '원';

  // 계산 로직 (24개월 기준)
  const calculateResult = () => {
    const safePhonePrice = Number(phonePrice) || 0;
    const safeUnlockedDiscount = Number(unlockedDiscount) || 0;
    const safeMvnoPlan = Number(mvnoPlan) || 0;
    const safeSubsidy = Number(subsidy) || 0;
    const safeHighPlan = Number(highPlan) || 0;
    const safeHighPlanMonths = Number(highPlanMonths) || 0;
    const safeNormalPlan = Number(normalPlan) || 0;

    // 선택약정(25% 할인) 적용
    const actualMvnoPlan = isUnlockedContract ? safeMvnoPlan * 0.75 : safeMvnoPlan;
    const actualHighPlan = isCarrierContract ? safeHighPlan * 0.75 : safeHighPlan;
    const actualNormalPlan = isCarrierContract ? safeNormalPlan * 0.75 : safeNormalPlan;

    // 1. 자급제 총 비용
    const actualUnlockedPrice = Math.max(0, safePhonePrice - safeUnlockedDiscount);
    const unlockedTotal = actualUnlockedPrice + actualMvnoPlan * 24;

    // 2. 통신사 총 비용
    const carrierDevicePrice = Math.max(0, safePhonePrice - safeSubsidy);
    const carrierInterest = carrierDevicePrice * 0.059; // 24개월 할부 이자 (약 5.9%)
    const carrierPlanCost = (actualHighPlan * safeHighPlanMonths) + (actualNormalPlan * Math.max(0, 24 - safeHighPlanMonths));
    
    const extraServicesTotal = extraServices.reduce((acc, curr) => {
      return acc + (Number(curr.price) || 0) * (Number(curr.months) || 0);
    }, 0);

    const carrierTotal = carrierDevicePrice + carrierInterest + carrierPlanCost + extraServicesTotal;

    const diff = Math.abs(unlockedTotal - carrierTotal);
    const isUnlockedBetter = unlockedTotal < carrierTotal;

    return { 
      unlockedTotal, carrierTotal, diff, isUnlockedBetter, 
      actualUnlockedPrice, carrierDevicePrice, carrierInterest, carrierPlanCost, extraServicesTotal,
      actualMvnoPlan, actualHighPlan, actualNormalPlan
    };
  };

  const { 
    unlockedTotal, carrierTotal, diff, isUnlockedBetter, 
    actualUnlockedPrice, carrierDevicePrice, carrierInterest, carrierPlanCost, extraServicesTotal,
    actualMvnoPlan, actualHighPlan, actualNormalPlan
  } = calculateResult();

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4 font-sans text-gray-900">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg min-h-[600px] flex flex-col relative overflow-hidden">
        
        {/* Step 0: 시작 화면 */}
        {step === 0 && (
          <div className="p-8 flex flex-col h-full justify-between animate-fade-in flex-1">
            <div className="mt-10">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="text-blue-600 w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold leading-tight mb-4">
                호갱 탈출 계산기<br />
                <span className="text-blue-600">자급제 vs 통신사</span>
              </h1>
              <p className="text-gray-500 text-lg">
                숨은 부가서비스, 할부이자, 선택약정까지!<br />24개월 총 유지비를 비교해 드려요.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full bg-blue-600 text-white font-bold text-lg py-5 rounded-2xl hover:bg-blue-700 transition-colors mt-12"
            >
              시작하기
            </button>
          </div>
        )}

        {/* Step 1: 기기값 & 자급제 할인 입력 */}
        {step === 1 && (
          <div className="p-8 flex flex-col h-full justify-between animate-fade-in flex-1">
            <div>
              <h2 className="text-2xl font-bold mb-6">사고 싶은 스마트폰의<br />기계값은 얼마인가요?</h2>
              
              <div className="mb-8">
                <label className="text-sm font-bold text-gray-600 mb-1 block">출고가 (정가)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={phonePrice}
                    onChange={(e) => setPhonePrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-2xl font-bold border-b-2 border-blue-500 pb-2 focus:outline-none bg-transparent"
                    placeholder="예: 1250000"
                  />
                  <span className="absolute right-0 bottom-3 text-xl font-bold text-gray-500">원</span>
                </div>
                <div className="text-blue-500 font-medium text-sm mt-2">{formatKorean(phonePrice)}</div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">자급제 구매 시 할인 금액 (선택)</label>
                <p className="text-xs text-gray-400 mb-2">오픈마켓 쿠폰, 카드 즉시할인 등</p>
                <div className="relative">
                  <input
                    type="number"
                    value={unlockedDiscount}
                    onChange={(e) => setUnlockedDiscount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xl font-bold border-b-2 border-gray-300 focus:border-blue-500 pb-2 focus:outline-none bg-transparent"
                    placeholder="예: 100000"
                  />
                  <span className="absolute right-0 bottom-3 text-lg font-bold text-gray-500">원</span>
                </div>
                <div className="text-blue-500 font-medium text-sm mt-2">{formatKorean(unlockedDiscount)}</div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 text-white font-bold text-lg py-5 rounded-2xl flex justify-center items-center gap-2 mt-8"
            >
              다음 <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: 자급제 (현재 요금제) 입력 */}
        {step === 2 && (
          <div className="p-8 flex flex-col h-full justify-between animate-fade-in flex-1">
            <div>
              <h2 className="text-2xl font-bold mb-2">자급제를 산다면<br />한 달 통신비는 얼마인가요?</h2>
              <p className="text-gray-500 mb-8">기존 통신사를 유지하거나 알뜰폰 요금을 적어주세요.</p>
              
              <div className="relative">
                <input
                  type="number"
                  value={mvnoPlan}
                  onChange={(e) => setMvnoPlan(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-2xl font-bold border-b-2 border-blue-500 pb-2 focus:outline-none bg-transparent"
                  placeholder="예: 33000"
                />
                <span className="absolute right-0 bottom-3 text-xl font-bold text-gray-500">원</span>
              </div>
              <div className="text-blue-500 font-medium text-sm mt-2">{formatKorean(mvnoPlan)}</div>

              {/* 자급제 선택약정 체크박스 */}
              <label className="flex items-center gap-3 mt-6 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={isUnlockedContract}
                    onChange={(e) => setIsUnlockedContract(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">선택약정 25% 할인 적용</span>
                  {isUnlockedContract && (
                    <span className="text-xs text-blue-600 font-medium mt-1">
                      할인 적용됨: 월 {formatKorean(actualMvnoPlan)}
                    </span>
                  )}
                </div>
              </label>
            </div>
            <div className="flex gap-3 mt-12">
              <button onClick={() => setStep(1)} className="p-5 bg-gray-100 rounded-2xl text-gray-600 font-bold">이전</button>
              <button onClick={() => setStep(3)} className="flex-1 bg-blue-600 text-white font-bold text-lg py-5 rounded-2xl flex justify-center items-center gap-2">
                다음 <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 통신사 조건 입력 (부가서비스 포함) */}
        {step === 3 && (
          <div className="p-8 flex flex-col h-full animate-fade-in flex-1 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">통신사에서 제시한<br />조건을 알려주세요.</h2>
            
            <div className="space-y-6 flex-1">
              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">기기값에서 할인받은 금액 (공시/매장지원금 등)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={subsidy}
                    onChange={(e) => setSubsidy(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xl font-bold bg-gray-100 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-4 text-lg text-gray-500 font-bold">원</span>
                </div>
                <div className="text-blue-500 font-medium text-sm mt-1 px-1">{formatKorean(subsidy)}</div>
              </div>

              {/* 통신사 선택약정 체크박스 */}
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={isCarrierContract}
                    onChange={(e) => setIsCarrierContract(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">선택약정 가능 여부</span>
                  <span className="text-xs text-gray-500 mt-1">입력된 아래 요금제에서 각각 25%가 자동 할인됩니다.</span>
                </div>
              </label>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-bold text-gray-600 mb-1 block">강제 고가 요금제</label>
                  <input
                    type="number"
                    value={highPlan}
                    onChange={(e) => setHighPlan(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-lg font-bold bg-gray-100 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="text-blue-500 font-medium text-xs mt-1 px-1">
                    {isCarrierContract ? `할인됨: ${formatKorean(actualHighPlan)}` : formatKorean(highPlan)}
                  </div>
                </div>
                <div className="w-24">
                  <label className="text-sm font-bold text-gray-600 mb-1 block">유지 개월</label>
                  <input
                    type="number"
                    value={highPlanMonths}
                    onChange={(e) => setHighPlanMonths(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-lg font-bold bg-gray-100 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-600 mb-1 block">이후 변경할 요금제</label>
                <span className="text-xs text-gray-500 mt-1">Tip. 변경 가능한 최소 요금제를 꼭 확인하세요.</span>
                <div className="relative">
                  <input
                    type="number"
                    value={normalPlan}
                    onChange={(e) => setNormalPlan(e.target.value ? Number(e.target.value) : '')}
                    className="w-full text-xl font-bold bg-gray-100 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-4 text-lg text-gray-500 font-bold">원</span>
                </div>
                <div className="text-blue-500 font-medium text-sm mt-1 px-1">
                   {isCarrierContract ? `할인됨: ${formatKorean(actualNormalPlan)}` : formatKorean(normalPlan)}
                </div>
              </div>

              {/* 부가서비스 동적 추가 영역 */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-gray-600">강제 가입 부가서비스</label>
                  <button onClick={addExtraService} className="text-blue-600 text-sm font-bold flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">
                    <Plus className="w-4 h-4" /> 추가
                  </button>
                </div>
                
                {extraServices.length === 0 && (
                  <p className="text-sm text-gray-400">가입해야 할 부가서비스가 없다면 비워두세요.</p>
                )}

                <div className="space-y-3">
                  {extraServices.map((service, index) => (
                    <div key={service.id} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl border border-gray-200 animate-fade-in">
                      <div className="flex-1">
                        <input
                          type="number"
                          value={service.price}
                          onChange={(e) => updateExtraService(service.id, 'price', Number(e.target.value))}
                          placeholder="월 요금"
                          className="w-full text-sm font-bold bg-white p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          value={service.months}
                          onChange={(e) => updateExtraService(service.id, 'months', Number(e.target.value))}
                          placeholder="개월"
                          className="w-full text-sm font-bold bg-white p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-center"
                        />
                      </div>
                      <button 
                        onClick={() => removeExtraService(service.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 bg-white">
              <button onClick={() => setStep(2)} className="p-5 bg-gray-100 rounded-2xl text-gray-600 font-bold">이전</button>
              <button onClick={() => setStep(4)} className="flex-1 bg-blue-600 text-white font-bold text-lg py-5 rounded-2xl flex justify-center items-center gap-2">
                결과 보기 <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 최종 결과 */}
        {step === 4 && (
          <div className="p-8 flex flex-col h-full animate-fade-in bg-blue-50 flex-1 overflow-y-auto">
            <div className="mt-4">
              <h2 className="text-xl font-bold text-gray-600 mb-2">24개월 총 유지비 계산 결과</h2>
              <div className="text-3xl font-extrabold text-gray-900 leading-tight">
                {isUnlockedBetter ? '자급제' : '통신사'}로 사는 게<br />
                <span className="text-blue-600">{formatMoney(diff)}</span> 더 싸요!
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {/* 자급제 카드 */}
              <div className={`p-5 rounded-2xl border-2 transition-all ${isUnlockedBetter ? 'border-blue-500 bg-white shadow-md transform scale-[1.02]' : 'border-transparent bg-gray-100 opacity-70'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">자급제 구매</span>
                  {isUnlockedBetter && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">추천</span>}
                </div>
                <div className="text-2xl font-bold">{formatMoney(unlockedTotal)}</div>
                <div className="text-sm text-gray-500 mt-3 space-y-1">
                  <div>할인된 기기값 {formatMoney(actualUnlockedPrice)}</div>
                  <div>
                    + 통신비 {formatMoney(actualMvnoPlan * 24)} 
                    {isUnlockedContract && <span className="text-blue-500 text-xs ml-1">(선택약정 적용)</span>}
                  </div>
                </div>
              </div>

              {/* 통신사 카드 */}
              <div className={`p-5 rounded-2xl border-2 transition-all ${!isUnlockedBetter ? 'border-blue-500 bg-white shadow-md transform scale-[1.02]' : 'border-transparent bg-gray-100 opacity-70'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">통신사 약정 (할부)</span>
                  {!isUnlockedBetter && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">추천</span>}
                </div>
                <div className="text-2xl font-bold">{formatMoney(carrierTotal)}</div>
                <div className="text-sm text-gray-500 mt-3 space-y-1">
                  <div>할인된 기기값 {formatMoney(carrierDevicePrice)}</div>
                  <div className="text-red-500 font-medium">+ 할부 이자 5.9% ({formatMoney(Math.floor(carrierInterest))})</div>
                  <div>
                    + 요금제 통신비 {formatMoney(carrierPlanCost)}
                    {isCarrierContract && <span className="text-blue-500 text-xs ml-1">(선택약정 적용)</span>}
                  </div>
                  {extraServicesTotal > 0 && (
                    <div className="text-red-500 font-medium">+ 강제 부가서비스 ({formatMoney(extraServicesTotal)})</div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(0)}
              className="mt-8 w-full bg-gray-900 text-white font-bold text-lg py-5 rounded-2xl flex justify-center items-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" /> 다시 계산하기
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
        /* 체크박스 커스텀을 위한 유틸 */
        input[type="checkbox"] {
          accent-color: #2563eb;
        }
      `}} />
    </div>
  );
}