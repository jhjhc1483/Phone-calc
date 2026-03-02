'use client';

import { useState } from 'react';
import { ChevronRight, Smartphone, RefreshCcw, CheckCircle2 } from 'lucide-react';

export default function PhoneCalculator() {
  // 퍼널(Funnel) 상태 관리
  const [step, setStep] = useState(0);

  // 1. 단말기 기본 정보
  const [phonePrice, setPhonePrice] = useState(1250000); // 예: 125만 원

  // 2. 자급제 + 알뜰폰 상태
  const [mvnoPlan, setMvnoPlan] = useState(33000);

  // 3. 통신사 약정 상태
  const [subsidy, setSubsidy] = useState(500000); // 공시지원금 + 추가지원금
  const [highPlan, setHighPlan] = useState(99000); // 강제 고가 요금제
  const [highPlanMonths, setHighPlanMonths] = useState(6); // 의무 유지 기간
  const [normalPlan, setNormalPlan] = useState(55000); // 이후 변경할 요금제

  // 계산 로직 (24개월 기준)
  const calculateResult = () => {
    // 1. 자급제 총 비용
    const unlockedTotal = phonePrice + mvnoPlan * 24;

    // 2. 통신사 총 비용
    const carrierDevicePrice = Math.max(0, phonePrice - subsidy);
    const carrierInterest = carrierDevicePrice * 0.062; // 24개월 할부 이자 (약 5.9~6.2% 수준 적용)
    const carrierPlanCost = highPlan * highPlanMonths + normalPlan * (24 - highPlanMonths);
    const carrierTotal = carrierDevicePrice + carrierInterest + carrierPlanCost;

    const diff = Math.abs(unlockedTotal - carrierTotal);
    const isUnlockedBetter = unlockedTotal < carrierTotal;

    return { unlockedTotal, carrierTotal, diff, isUnlockedBetter };
  };

  const { unlockedTotal, carrierTotal, diff, isUnlockedBetter } = calculateResult();

  // 화폐 포맷터
  const formatMoney = (amount: number) => amount.toLocaleString() + '원';

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4 font-sans text-gray-900">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg min-h-[500px] flex flex-col relative overflow-hidden">
        
        {/* Step 0: 시작 화면 */}
        {step === 0 && (
          <div className="p-8 flex flex-col h-full justify-between animate-fade-in">
            <div className="mt-10">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="text-blue-600 w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold leading-tight mb-4">
                호갱 탈출 계산기<br />
                <span className="text-blue-600">자급제 vs 통신사</span>
              </h1>
              <p className="text-gray-500 text-lg">
                24개월 동안 진짜 어디가 더 싼지<br />1분 만에 정확히 계산해 드릴게요.
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

        {/* Step 1: 기기값 입력 */}
        {step === 1 && (
          <div className="p-8 flex flex-col h-full justify-between animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold mb-2">사고 싶은 스마트폰의<br />기계값은 얼마인가요?</h2>
              <p className="text-gray-500 mb-8">출고가 또는 자급제 구매 예정가를 적어주세요.</p>
              
              <div className="relative">
                <input
                  type="number"
                  value={phonePrice || ''}
                  onChange={(e) => setPhonePrice(Number(e.target.value))}
                  className="w-full text-2xl font-bold border-b-2 border-blue-500 pb-2 focus:outline-none bg-transparent"
                  placeholder="예: 1250000"
                />
                <span className="absolute right-0 bottom-3 text-xl font-bold text-gray-500">원</span>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 text-white font-bold text-lg py-5 rounded-2xl flex justify-center items-center gap-2 mt-12"
            >
              다음 <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: 자급제 (현재 요금제) 입력 */}
        {step === 2 && (
          <div className="p-8 flex flex-col h-full justify-between animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold mb-2">자급제를 산다면<br />한 달 통신비는 얼마인가요?</h2>
              <p className="text-gray-500 mb-8">현재 쓰는 요금제나 알뜰폰 요금을 적어주세요.</p>
              
              <div className="relative">
                <input
                  type="number"
                  value={mvnoPlan || ''}
                  onChange={(e) => setMvnoPlan(Number(e.target.value))}
                  className="w-full text-2xl font-bold border-b-2 border-blue-500 pb-2 focus:outline-none bg-transparent"
                  placeholder="예: 33000"
                />
                <span className="absolute right-0 bottom-3 text-xl font-bold text-gray-500">원</span>
              </div>
            </div>
            <div className="flex gap-3 mt-12">
              <button onClick={() => setStep(1)} className="p-5 bg-gray-100 rounded-2xl text-gray-600 font-bold">이전</button>
              <button onClick={() => setStep(3)} className="flex-1 bg-blue-600 text-white font-bold text-lg py-5 rounded-2xl flex justify-center items-center gap-2">
                다음 <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 통신사 조건 입력 */}
        {step === 3 && (
          <div className="p-8 flex flex-col h-full justify-between animate-fade-in overflow-y-auto">
            <div>
              <h2 className="text-2xl font-bold mb-6">통신사에서 제시한<br />조건을 알려주세요.</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-gray-600 mb-1 block">기기값 할인 (공시지원금 등)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={subsidy || ''}
                      onChange={(e) => setSubsidy(Number(e.target.value))}
                      className="w-full text-xl font-bold bg-gray-100 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-4 top-4 text-lg text-gray-500 font-bold">원</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-bold text-gray-600 mb-1 block">강제 고가 요금제</label>
                    <input
                      type="number"
                      value={highPlan || ''}
                      onChange={(e) => setHighPlan(Number(e.target.value))}
                      className="w-full text-lg font-bold bg-gray-100 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-sm font-bold text-gray-600 mb-1 block">유지 개월</label>
                    <input
                      type="number"
                      value={highPlanMonths || ''}
                      onChange={(e) => setHighPlanMonths(Number(e.target.value))}
                      className="w-full text-lg font-bold bg-gray-100 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-600 mb-1 block">이후 변경할 요금제</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={normalPlan || ''}
                      onChange={(e) => setNormalPlan(Number(e.target.value))}
                      className="w-full text-xl font-bold bg-gray-100 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-4 top-4 text-lg text-gray-500 font-bold">원</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(2)} className="p-5 bg-gray-100 rounded-2xl text-gray-600 font-bold">이전</button>
              <button onClick={() => setStep(4)} className="flex-1 bg-blue-600 text-white font-bold text-lg py-5 rounded-2xl flex justify-center items-center gap-2">
                결과 보기 <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 최종 결과 */}
        {step === 4 && (
          <div className="p-8 flex flex-col h-full animate-fade-in bg-blue-50">
            <div className="mt-4">
              <h2 className="text-xl font-bold text-gray-600 mb-2">24개월 총 유지비 계산 결과</h2>
              <div className="text-3xl font-extrabold text-gray-900 leading-tight">
                {isUnlockedBetter ? '자급제' : '통신사'}로 사는 게<br />
                <span className="text-blue-600">{formatMoney(diff)}</span> 더 싸요!
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {/* 자급제 카드 */}
              <div className={`p-5 rounded-2xl border-2 ${isUnlockedBetter ? 'border-blue-500 bg-white shadow-md' : 'border-transparent bg-gray-100 opacity-70'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">자급제 + 알뜰폰</span>
                  {isUnlockedBetter && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">추천</span>}
                </div>
                <div className="text-2xl font-bold">{formatMoney(unlockedTotal)}</div>
                <div className="text-sm text-gray-500 mt-2">
                  기기값 {formatMoney(phonePrice)} + 통신비 {formatMoney(mvnoPlan * 24)}
                </div>
              </div>

              {/* 통신사 카드 */}
              <div className={`p-5 rounded-2xl border-2 ${!isUnlockedBetter ? 'border-blue-500 bg-white shadow-md' : 'border-transparent bg-gray-100 opacity-70'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg">통신사 약정 (할부)</span>
                  {!isUnlockedBetter && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">추천</span>}
                </div>
                <div className="text-2xl font-bold">{formatMoney(carrierTotal)}</div>
                <div className="text-sm text-gray-500 mt-2 space-y-1">
                  <div>할인된 기기값 {formatMoney(carrierDevicePrice)}</div>
                  <div className="text-red-500">+ 할부 이자 5.9% ({formatMoney(Math.floor(carrierInterest))})</div>
                  <div>+ 통신비 {formatMoney(carrierPlanCost)}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(0)}
              className="mt-auto w-full bg-gray-900 text-white font-bold text-lg py-5 rounded-2xl flex justify-center items-center gap-2"
            >
              <RefreshCcw className="w-5 h-5" /> 다시 계산하기
            </button>
          </div>
        )}
      </div>

      {/* 간단한 애니메이션용 CSS (Tailwind 플러그인 없이 인라인 적용) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}} />
    </div>
  );
}