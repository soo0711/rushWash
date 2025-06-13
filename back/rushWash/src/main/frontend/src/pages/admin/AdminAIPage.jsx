import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminAIPage = () => {
  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [modelInfo, setModelInfo] = useState(null);
  const [modelPerformance, setModelPerformance] = useState(null);
  const [categoryPerformance, setCategoryPerformance] = useState([]);

  // 영어 카테고리명을 한국어로 변환 (얼룩 모델용)
  const getCategoryKoreanName = (englishName) => {
    const nameMap = {
      blood: "혈액",
      coffee: "커피",
      earth: "흙/먼지",
      ink: "잉크",
      kimchi: "김치",
      lipstick: "립스틱",
      mustard: "머스타드",
      oil: "기름",
      wine: "와인",
    };
    return nameMap[englishName] || englishName;
  };

  // JSON 데이터를 가공하는 함수
  const processStainModelData = (jsonData) => {
    // 데이터 구조 확인을 위한 로그
    console.log("로드된 JSON 데이터:", jsonData);

    // 필수 데이터 존재 여부 확인
    if (!jsonData || !jsonData.per_class || !jsonData.overall) {
      console.error("JSON 데이터 구조가 올바르지 않습니다:", jsonData);
      throw new Error("JSON 파일의 구조가 예상과 다릅니다.");
    }

    // 카테고리별 성능 데이터 생성
    const categoryData = Object.entries(jsonData.per_class).map(
      ([category, data]) => ({
        model: "stain_model",
        category: getCategoryKoreanName(category),
        accuracy: (data.top1_acc * 100).toFixed(1),
      })
    );

    return {
      modelInfo: {
        name: "StainClassifier",
        version: "v1.0", // JSON에 version 정보가 없어서 기본값 사용
        last_updated: "2025-05-01", // 실제로는 파일 수정 날짜나 별도 필드에서 가져와야 함
        status: "active",
        description: "얼룩 분류 및 세탁 방법 추천 모델",
      },
      performance: {
        accuracy: (jsonData.overall.accuracy * 100).toFixed(1),
        precision: (jsonData.overall.precision * 100).toFixed(1),
        recall: (jsonData.overall.recall * 100).toFixed(1),
        prediction_count: jsonData.overall.samples,
        avg_response_time:
          jsonData.overall.response_time.avg_per_image_s.toFixed(4),
      },
      categoryPerformance: categoryData,
    };
  };

  // 세탁기호 JSON 데이터를 가공하는 함수
  const processFabricModelData = (jsonData) => {
    console.log("세탁기호 JSON 데이터:", jsonData);

    if (!jsonData || !jsonData.per_class) {
      console.error("세탁기호 JSON 데이터 구조가 올바르지 않습니다:", jsonData);
      throw new Error("세탁기호 JSON 파일의 구조가 예상과 다릅니다.");
    }

    // 카테고리별 성능 데이터 생성
    const categoryData = Object.entries(jsonData.per_class).map(
      ([category, accuracy]) => ({
        model: "fabric_model",
        category: getSymbolKoreanName(category),
        accuracy: (accuracy * 100).toFixed(1),
      })
    );

    return {
      modelInfo: {
        name: "SymbolClassifier",
        version: "v1.0",
        last_updated: "2025-04-15",
        status: "active",
        description: "세탁기호 분석 및 취급 방법 추천 모델",
      },
      performance: {
        accuracy: (jsonData.accuracy * 100).toFixed(1),
        precision: (jsonData.precision * 100).toFixed(1),
        recall: (jsonData.recall * 100).toFixed(1),
        prediction_count: Object.keys(jsonData.per_class).length * 100, // 추정값
        avg_response_time: (jsonData.inference_time_ms / 1000).toFixed(4),
      },
      categoryPerformance: categoryData,
    };
  };

  // 세탁기호 영어명을 한국어로 변환
  const getSymbolKoreanName = (englishName) => {
    const symbolMap = {
      // 온도 관련
      "30C": "30℃ 세탁",
      "40C": "40℃ 세탁",
      "50C": "50℃ 세탁",
      "60C": "60℃ 세탁",
      "70C": "70℃ 세탁",
      "95C": "95℃ 세탁",

      // 금지 표시 (DN = Do Not)
      DN_bleach: "표백 금지",
      DN_dry: "건조 금지",
      DN_dry_clean: "드라이클리닝 금지",
      DN_iron: "다림질 금지",
      DN_steam: "스팀 금지",
      DN_tumble_dry: "회전건조 금지",
      DN_wash: "세탁 금지",
      DN_wet_clean: "습식청소 금지",
      DN_wring: "비틀어 짜기 금지",

      // 표백
      bleach: "표백 가능",
      chlorine_bleach: "염소계 표백제 가능",
      non_chlorine_bleach: "무염소 표백제만 가능",

      // 건조
      drip_dry: "자연건조",
      drip_dry_in_shade: "그늘에서 자연건조",
      dry_flat: "평평하게 건조",
      dry_flat_in_shade: "그늘에서 평평하게 건조",
      line_dry: "줄에 걸어서 건조",
      line_dry_in_shade: "그늘에서 줄걸이 건조",
      natural_dry: "자연건조",
      shade_dry: "그늘 건조",

      // 드라이클리닝
      dry_clean: "드라이클리닝",
      dry_clean_any_solvent_except_trichloroethylene:
        "특정 용제 제외 드라이클리닝",
      dry_clean_petrol_only: "석유계 용제만 드라이클리닝",

      // 세탁
      hand_wash: "손세탁",
      machine_wash: "기계세탁",

      // 다림질
      iron: "다림질 가능",
      iron_high: "고온 다림질",
      iron_medium: "중온 다림질",
      iron_low: "저온 다림질",
      steam: "스팀 가능",

      // 회전건조
      tumble_dry_normal: "회전건조 보통",
      tumble_dry_low: "회전건조 저온",
      tumble_dry_medium: "회전건조 중온",
      tumble_dry_high: "회전건조 고온",
      tumble_dry_no_heat: "회전건조 무열",

      // 기타
      wet_clean: "습식청소",
      wring: "비틀어 짜기",
    };

    return symbolMap[englishName] || englishName;
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        // 얼룩 분석 모델과 세탁기호 모델 JSON 데이터 로드
        console.log("JSON 파일들을 불러오는 중...");

        // 얼룩 모델 데이터 로드
        const stainResponse = await fetch(
          "/performance/stain/performance.json"
        );
        console.log(
          "얼룩 모델 응답 상태:",
          stainResponse.status,
          stainResponse.statusText
        );

        if (!stainResponse.ok) {
          throw new Error(
            `HTTP 오류: ${stainResponse.status} - 얼룩 모델 데이터를 불러올 수 없습니다.`
          );
        }

        const stainJsonData = await stainResponse.json();
        console.log("얼룩 모델 JSON 파싱 완료:", stainJsonData);

        // 세탁기호 모델 데이터 로드
        const symbolResponse = await fetch(
          "/performance/symbol/performance.json"
        );
        console.log(
          "세탁기호 모델 응답 상태:",
          symbolResponse.status,
          symbolResponse.statusText
        );

        if (!symbolResponse.ok) {
          throw new Error(
            `HTTP 오류: ${symbolResponse.status} - 세탁기호 모델 데이터를 불러올 수 없습니다.`
          );
        }

        const symbolJsonData = await symbolResponse.json();
        console.log("세탁기호 모델 JSON 파싱 완료:", symbolJsonData);

        // JSON 데이터 가공
        const processedStainData = processStainModelData(stainJsonData);
        const processedSymbolData = processFabricModelData(symbolJsonData);

        // 상태 설정
        setModelInfo({
          stain_model: processedStainData.modelInfo,
          fabric_model: processedSymbolData.modelInfo,
        });

        setModelPerformance({
          stain_model: processedStainData.performance,
          fabric_model: processedSymbolData.performance,
        });

        setCategoryPerformance([
          ...processedStainData.categoryPerformance,
          ...processedSymbolData.categoryPerformance,
        ]);
      } catch (error) {
        console.error("데이터 로드 중 오류 발생:", error);
        alert("데이터를 불러오는 중 오류가 발생했습니다: " + error.message);

        // 오류 발생 시 기존 더미 데이터로 폴백
        const dummyModelInfo = {
          stain_model: {
            name: "StainClassifier",
            version: "1.0.3",
            last_updated: "2025-05-01",
            status: "active",
            description: "얼룩 분류 및 세탁 방법 추천 모델",
          },
          fabric_model: {
            name: "FabricAnalyzer",
            version: "1.1.5",
            last_updated: "2025-04-15",
            status: "active",
            description: "섬유 유형 분석 및 취급 방법 추천 모델",
          },
        };

        const dummyModelPerformance = {
          stain_model: {
            accuracy: 94.2,
            precision: 93.7,
            recall: 92.8,
            prediction_count: 10453,
            avg_response_time: 0.38,
          },
          fabric_model: {
            accuracy: 91.3,
            precision: 90.5,
            recall: 91.2,
            prediction_count: 5389,
            avg_response_time: 0.45,
          },
        };

        const dummyCategoryPerformance = [
          { model: "stain_model", category: "음식물", accuracy: 95.3 },
          { model: "stain_model", category: "기름", accuracy: 93.8 },
          { model: "stain_model", category: "잉크", accuracy: 91.2 },
          { model: "stain_model", category: "흙/먼지", accuracy: 94.5 },
          { model: "stain_model", category: "화장품", accuracy: 92.1 },
          { model: "fabric_model", category: "면", accuracy: 94.2 },
          { model: "fabric_model", category: "울/캐시미어", accuracy: 89.3 },
          { model: "fabric_model", category: "합성 섬유", accuracy: 91.7 },
          { model: "fabric_model", category: "실크", accuracy: 88.5 },
          { model: "fabric_model", category: "린넨", accuracy: 90.8 },
        ];

        setModelInfo(dummyModelInfo);
        setModelPerformance(dummyModelPerformance);
        setCategoryPerformance(dummyCategoryPerformance);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex justify-center items-center">
          <p className="text-xl">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 바 */}
        <header className="bg-white shadow-md z-10">
          <div className="flex justify-between items-center px-8 py-6">
            <h1 className="text-3xl font-semibold text-gray-800">
              AI 성능 및 관리
            </h1>
          </div>
        </header>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {/* 모델 카드 섹션 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 얼룩 분석 모델 카드 */}
            <div className="bg-white rounded-md shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {modelInfo.stain_model.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {modelInfo.stain_model.description}
                  </p>
                </div>
                <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {modelInfo.stain_model.status === "active"
                    ? "활성"
                    : "비활성"}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">버전</div>
                  <div className="font-medium">
                    {modelInfo.stain_model.version}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">마지막 업데이트</div>
                  <div className="font-medium">
                    {modelInfo.stain_model.last_updated}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">정확도</div>
                  <div className="font-medium text-green-600">
                    {modelPerformance.stain_model.accuracy}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">예측 횟수</div>
                  <div className="font-medium">
                    {modelPerformance.stain_model.prediction_count.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* 섬유 분석 모델 카드 */}
            <div className="bg-white rounded-md shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {modelInfo.fabric_model.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {modelInfo.fabric_model.description}
                  </p>
                </div>
                <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {modelInfo.fabric_model.status === "active"
                    ? "활성"
                    : "비활성"}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">버전</div>
                  <div className="font-medium">
                    {modelInfo.fabric_model.version}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">마지막 업데이트</div>
                  <div className="font-medium">
                    {modelInfo.fabric_model.last_updated}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">정확도</div>
                  <div className="font-medium text-green-600">
                    {modelPerformance.fabric_model.accuracy}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">예측 횟수</div>
                  <div className="font-medium">
                    {modelPerformance.fabric_model.prediction_count.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 최근 성능 및 통계 */}
          <div className="bg-white rounded-md shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              최근 성능 통계
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 얼룩 분석 성능 통계 */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">
                  {modelInfo.stain_model.name} 성능
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-sm text-gray-500">정확도</div>
                      <div className="font-medium">
                        {modelPerformance.stain_model.accuracy}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">정밀도</div>
                      <div className="font-medium">
                        {modelPerformance.stain_model.precision}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">재현율</div>
                      <div className="font-medium">
                        {modelPerformance.stain_model.recall}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">응답 시간</div>
                      <div className="font-medium">
                        {modelPerformance.stain_model.avg_response_time}초
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      카테고리별 정확도
                    </h4>
                    {categoryPerformance
                      .filter((item) => item.model === "stain_model")
                      .map((item, index) => (
                        <div key={index} className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.category}</span>
                            <span>{item.accuracy}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${item.accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* 섬유 분석 성능 통계 */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">
                  {modelInfo.fabric_model.name} 성능
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-sm text-gray-500">정확도</div>
                      <div className="font-medium">
                        {modelPerformance.fabric_model.accuracy}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">정밀도</div>
                      <div className="font-medium">
                        {modelPerformance.fabric_model.precision}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">재현율</div>
                      <div className="font-medium">
                        {modelPerformance.fabric_model.recall}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">응답 시간</div>
                      <div className="font-medium">
                        {modelPerformance.fabric_model.avg_response_time}초
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      카테고리별 정확도
                    </h4>
                    {categoryPerformance
                      .filter((item) => item.model === "fabric_model")
                      .map((item, index) => (
                        <div key={index} className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.category}</span>
                            <span>{item.accuracy}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${item.accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAIPage;
