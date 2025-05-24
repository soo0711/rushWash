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

  // JSON 데이터를 가공하는 함수 (새로운 구조에 맞게 수정)
  const processStainModelData = (jsonData) => {
    // 데이터 구조 확인을 위한 로그
    console.log("로드된 JSON 데이터:", jsonData);

    // 필수 데이터 존재 여부 확인 (새로운 구조에 맞게 수정)
    if (
      !jsonData ||
      !jsonData.metrics ||
      !jsonData.metrics.per_class ||
      !jsonData.metrics.overall
    ) {
      console.error("JSON 데이터 구조가 올바르지 않습니다:", jsonData);
      throw new Error("JSON 파일의 구조가 예상과 다릅니다.");
    }

    const { metrics } = jsonData;

    // 카테고리별 성능 데이터 생성
    const categoryData = Object.entries(metrics.per_class).map(
      ([category, data]) => ({
        model: "stain_model",
        category: getCategoryKoreanName(category),
        accuracy: (data.top1_acc * 100).toFixed(1),
        samples: data.samples,
        miss: data.miss,
        top3_acc: (data.top3_acc * 100).toFixed(1),
      })
    );

    return {
      modelInfo: {
        name: "StainClassifier",
        version: jsonData.model_version || "v1.0",
        model_type: jsonData.model_type || "stain",
        weights_path: jsonData.weights_path || "N/A",
        last_updated: "2025-05-01", // 실제로는 파일 수정 날짜나 별도 필드에서 가져와야 함
        status: "active",
        description: "얼룩 분류 및 세탁 방법 추천 모델",
      },
      performance: {
        accuracy: (metrics.overall.accuracy * 100).toFixed(1),
        precision: (metrics.overall.precision * 100).toFixed(1),
        recall: (metrics.overall.recall * 100).toFixed(1),
        top1_acc: (metrics.overall.top1_acc * 100).toFixed(1),
        top3_acc: (metrics.overall.top3_acc * 100).toFixed(1),
        total_samples: metrics.overall.samples,
        total_miss: metrics.overall.miss,
        prediction_count: metrics.overall.samples,
        avg_response_time:
          metrics.overall.inference_time.avg_per_image_s.toFixed(4),
        total_inference_time: metrics.overall.inference_time.total_s.toFixed(4),
      },
      categoryPerformance: categoryData,
    };
  };

  // 세탁기호 JSON 데이터를 가공하는 함수 (새로운 구조에 맞게 수정)
  const processFabricModelData = (jsonData) => {
    console.log("세탁기호 JSON 데이터:", jsonData);

    // 필수 데이터 존재 여부 확인 (새로운 구조에 맞게 수정)
    if (!jsonData || !jsonData.metrics || !jsonData.metrics.per_class) {
      console.error("세탁기호 JSON 데이터 구조가 올바르지 않습니다:", jsonData);
      throw new Error("세탁기호 JSON 파일의 구조가 예상과 다릅니다.");
    }

    const { metrics } = jsonData;

    // 카테고리별 성능 데이터 생성
    const categoryData = Object.entries(metrics.per_class).map(
      ([category, accuracy]) => ({
        model: "fabric_model",
        category: getSymbolKoreanName(category),
        accuracy: (accuracy * 100).toFixed(1),
      })
    );

    return {
      modelInfo: {
        name: "SymbolClassifier",
        version: jsonData.model_version || "v1.0",
        model_type: jsonData.model_type || "symbol",
        weights_path: jsonData.weights_path || "N/A",
        last_updated: "2025-04-15",
        status: "active",
        description: "세탁기호 분석 및 취급 방법 추천 모델",
      },
      performance: {
        mAP50: (metrics.mAP50 * 100).toFixed(1),
        mAP50_95: (metrics["mAP50-95"] * 100).toFixed(1),
        precision: (metrics.precision * 100).toFixed(1),
        recall: (metrics.recall * 100).toFixed(1),
        prediction_count: Object.keys(metrics.per_class).length, // 클래스 수
        avg_response_time: (metrics.inference_time_ms / 1000).toFixed(4),
        inference_time_ms: metrics.inference_time_ms.toFixed(2),
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
            version: "v1.0",
            last_updated: "2025-05-01",
            status: "active",
            description: "얼룩 분류 및 세탁 방법 추천 모델",
          },
          fabric_model: {
            name: "SymbolClassifier",
            version: "v1.0",
            last_updated: "2025-04-15",
            status: "active",
            description: "세탁기호 분석 및 취급 방법 추천 모델",
          },
        };

        const dummyModelPerformance = {
          stain_model: {
            accuracy: 86.8,
            precision: 93.2,
            recall: 86.8,
            prediction_count: 91,
            avg_response_time: 0.0258,
          },
          fabric_model: {
            mAP50: 69.7,
            mAP50_95: 48.4,
            precision: 68.4,
            recall: 67.5,
            prediction_count: 42,
            avg_response_time: 0.0088,
            inference_time_ms: 8.79,
          },
        };

        const dummyCategoryPerformance = [
          { model: "stain_model", category: "혈액", accuracy: 84.6 },
          { model: "stain_model", category: "커피", accuracy: 93.3 },
          { model: "stain_model", category: "흙/먼지", accuracy: 100.0 },
          { model: "stain_model", category: "잉크", accuracy: 84.6 },
          { model: "stain_model", category: "김치", accuracy: 61.5 },
          { model: "stain_model", category: "립스틱", accuracy: 83.3 },
          { model: "stain_model", category: "머스타드", accuracy: 100.0 },
          { model: "stain_model", category: "기름", accuracy: 100.0 },
          { model: "stain_model", category: "와인", accuracy: 90.0 },
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
                  <div className="text-sm text-gray-500">총 샘플 수</div>
                  <div className="font-medium">
                    {modelPerformance.stain_model.total_samples}
                  </div>
                </div>
              </div>

              {/* 추가 성능 지표 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Top-1 정확도</div>
                    <div className="font-medium text-blue-600">
                      {modelPerformance.stain_model.top1_acc}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Top-3 정확도</div>
                    <div className="font-medium text-blue-600">
                      {modelPerformance.stain_model.top3_acc}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">오분류 수</div>
                    <div className="font-medium text-red-600">
                      {modelPerformance.stain_model.total_miss}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">평균 추론 시간</div>
                    <div className="font-medium">
                      {modelPerformance.stain_model.avg_response_time}초
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 세탁기호 분석 모델 카드 */}
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
                  <div className="text-sm text-gray-500">mAP@0.5</div>
                  <div className="font-medium text-green-600">
                    {modelPerformance.fabric_model.mAP50}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">클래스 수</div>
                  <div className="font-medium">
                    {modelPerformance.fabric_model.prediction_count}
                  </div>
                </div>
              </div>

              {/* 추가 성능 지표 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">mAP@0.5:0.95</div>
                    <div className="font-medium text-blue-600">
                      {modelPerformance.fabric_model.mAP50_95}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">정밀도</div>
                    <div className="font-medium text-blue-600">
                      {modelPerformance.fabric_model.precision}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">재현율</div>
                    <div className="font-medium text-orange-600">
                      {modelPerformance.fabric_model.recall}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">추론 시간</div>
                    <div className="font-medium">
                      {modelPerformance.fabric_model.inference_time_ms}ms
                    </div>
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

              {/* 세탁기호 분석 성능 통계 */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">
                  {modelInfo.fabric_model.name} 성능
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-sm text-gray-500">mAP@0.5</div>
                      <div className="font-medium">
                        {modelPerformance.fabric_model.mAP50}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">mAP@0.5:0.95</div>
                      <div className="font-medium">
                        {modelPerformance.fabric_model.mAP50_95}%
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
                      <div className="text-sm text-gray-500">추론 시간</div>
                      <div className="font-medium">
                        {modelPerformance.fabric_model.avg_response_time}초
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">클래스 수</div>
                      <div className="font-medium">
                        {modelPerformance.fabric_model.prediction_count}개
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      카테고리별 정확도 (상위 10개)
                    </h4>
                    {categoryPerformance
                      .filter((item) => item.model === "fabric_model")
                      .sort(
                        (a, b) =>
                          parseFloat(b.accuracy) - parseFloat(a.accuracy)
                      )
                      .slice(0, 10)
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
