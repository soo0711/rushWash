import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminAIPage = () => {
  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [modelInfo, setModelInfo] = useState(null);
  const [modelPerformance, setModelPerformance] = useState(null);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [isTraining, setIsTraining] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  // 초기 데이터 로드 (실제로는 API 호출)
  useEffect(() => {
    setLoading(true);

    // AI 모델 정보 더미 데이터
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

    // 성능 데이터
    const dummyModelPerformance = {
      stain_model: {
        accuracy: 94.2,
        precision: 93.7,
        recall: 92.8,
        prediction_count: 10453,
        avg_response_time: 0.38, // 초
      },
      fabric_model: {
        accuracy: 91.3,
        precision: 90.5,
        recall: 91.2,
        prediction_count: 5389,
        avg_response_time: 0.45, // 초
      },
    };

    // 카테고리별 성능
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
    setLoading(false);
  }, []);

  // 모델 상세 정보 모달 열기
  const openModelModal = (modelType) => {
    setSelectedModel({
      ...modelInfo[modelType],
      performance: modelPerformance[modelType],
      categories: categoryPerformance.filter(
        (item) => item.model === modelType
      ),
    });
    setIsModelModalOpen(true);
  };

  // 모델 재학습 시작
  const startTraining = (modelType) => {
    setIsTraining(true);

    // 학습 완료를 시뮬레이션 (3초 후)
    setTimeout(() => {
      // 모델 버전 업데이트
      const updatedModelInfo = { ...modelInfo };
      const versionParts = updatedModelInfo[modelType].version.split(".");
      versionParts[2] = (parseInt(versionParts[2]) + 1).toString();
      updatedModelInfo[modelType].version = versionParts.join(".");
      updatedModelInfo[modelType].last_updated = "2025-05-13"; // 오늘

      setModelInfo(updatedModelInfo);
      setIsTraining(false);
      alert(`${modelInfo[modelType].name} 모델 재학습이 완료되었습니다.`);
    }, 3000);
  };

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
                    v{modelInfo.stain_model.version}
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

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => openModelModal("stain_model")}
                  className="text-blue-600 border border-blue-600 px-3 py-1 rounded-md text-sm hover:bg-blue-50"
                >
                  상세 정보
                </button>
                <button
                  onClick={() => startTraining("stain_model")}
                  className={`bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 flex items-center ${
                    isTraining ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isTraining}
                >
                  {isTraining ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-1"></i> 학습 중...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sync mr-1"></i> 재학습
                    </>
                  )}
                </button>
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
                    v{modelInfo.fabric_model.version}
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

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => openModelModal("fabric_model")}
                  className="text-blue-600 border border-blue-600 px-3 py-1 rounded-md text-sm hover:bg-blue-50"
                >
                  상세 정보
                </button>
                <button
                  onClick={() => startTraining("fabric_model")}
                  className={`bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 flex items-center ${
                    isTraining ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isTraining}
                >
                  {isTraining ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-1"></i> 학습 중...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sync mr-1"></i> 재학습
                    </>
                  )}
                </button>
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

      {/* 모델 상세 정보 모달 */}
      {isModelModalOpen && selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedModel.name} 상세 정보
                </h3>
                <button
                  onClick={() => setIsModelModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    설명
                  </div>
                  <div className="text-sm">{selectedModel.description}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      버전
                    </div>
                    <div className="text-sm">v{selectedModel.version}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      상태
                    </div>
                    <div className="text-sm">
                      {selectedModel.status === "active" ? "활성" : "비활성"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      마지막 업데이트
                    </div>
                    <div className="text-sm">{selectedModel.last_updated}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      예측 횟수
                    </div>
                    <div className="text-sm">
                      {selectedModel.performance.prediction_count.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">
                    성능 메트릭
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">정확도</div>
                      <div className="text-sm font-bold text-green-600">
                        {selectedModel.performance.accuracy}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">정밀도</div>
                      <div className="text-sm font-bold">
                        {selectedModel.performance.precision}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">재현율</div>
                      <div className="text-sm font-bold">
                        {selectedModel.performance.recall}%
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">
                    카테고리별 정확도
                  </div>
                  <div className="max-h-40 overflow-y-auto pr-2">
                    {selectedModel.categories.map((item, index) => (
                      <div key={index} className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{item.category}</span>
                          <span>{item.accuracy}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`${
                              item.model === "stain_model"
                                ? "bg-blue-600"
                                : "bg-green-600"
                            } h-1.5 rounded-full`}
                            style={{ width: `${item.accuracy}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsModelModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAIPage;
