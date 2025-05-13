import React, { useState, useEffect } from "react";
import Header from "../../components/common/Header";
import { Link } from "react-router-dom";

const HistoryPage = () => {
  // 분석 내역 목록 상태
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 분석 내역 데이터 불러오기
  useEffect(() => {
    // 예시 데이터로 대체
    const fetchHistory = async () => {
      try {
        // 임시 목업 데이터
        const mockData = [
          {
            id: 1,
            date: "2025-04-23",
            type: "얼룩",
            result: "커피 얼룩, 중성세제와 미온수로 세탁 권장",
            imageUrl: null, // 실제로는 이미지 URL
            feedback: null, // null은 피드백을 아직 안한 상태
          },
          {
            id: 2,
            date: "2025-04-20",
            type: "라벨",
            result: "드라이클리닝 필요, 찬물 손세탁 가능",
            imageUrl: null,
            feedback: "like", // 이미 좋아요를 누른 상태
          },
          {
            id: 3,
            date: "2025-04-18",
            type: "얼룩과 라벨",
            result: "와인 얼룩, 드라이클리닝 권장",
            imageUrl: null,
            feedback: "dislike", // 이미 별로예요를 누른 상태
          },
        ];

        setHistoryItems(mockData);
        setLoading(false);
      } catch (error) {
        console.error("내역을 불러오는데 실패했습니다:", error);
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // 피드백 업데이트 핸들러
  const handleFeedback = (id, feedbackType) => {
    // 실제로는 API를 호출해 서버에 피드백 업데이트

    // 로컬 상태 업데이트
    setHistoryItems(
      historyItems.map((item) =>
        item.id === id
          ? {
              ...item,
              feedback: item.feedback === feedbackType ? null : feedbackType,
            }
          : item
      )
    );
  };

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
        <Header />
        <div className="container mx-auto max-w-md px-4 py-8 flex justify-center items-center">
          <p className="text-xl">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      <div className="container mx-auto max-w-md px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-6">분석 내역</h1>

        {historyItems.length === 0 ? (
          <p className="text-center text-2xl mt-10">분석 내역이 없습니다.</p>
        ) : (
          <div className="space-y-6">
            {historyItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-gray-500">{formatDate(item.date)}</p>
                    <h3 className="text-xl font-semibold">{item.type} 분석</h3>
                  </div>
                </div>

                <p className="text-lg mb-4">{item.result}</p>

                {/* 피드백 버튼 섹션 */}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                  <p className="text-gray-600">이 분석이 도움이 되었나요?</p>
                  <div className="flex space-x-3">
                    <button
                      className={`px-4 py-2 rounded-full border ${
                        item.feedback === "like"
                          ? "bg-blue-100 border-blue-500 text-blue-700"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                      onClick={() => handleFeedback(item.id, "like")}
                    >
                      👍 좋아요
                    </button>
                    <button
                      className={`px-4 py-2 rounded-full border ${
                        item.feedback === "dislike"
                          ? "bg-red-100 border-red-500 text-red-700"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                      onClick={() => handleFeedback(item.id, "dislike")}
                    >
                      👎 별로예요
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
