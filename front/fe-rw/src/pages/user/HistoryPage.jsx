import React, { useState, useEffect } from "react";
import Header from "../../components/common/Header";
import { Link } from "react-router-dom";
import { WASHING_API, PROXY_API, useProxy } from "../../constants/api";
import axios from "axios";

const HistoryPage = () => {
  // 분석 내역 목록 상태
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  //API URL 설정
  const WASHING_GET_ALL = useProxy ? PROXY_API.GET_ALL : WASHING_API.GET_ALL;
  const UPDATE_BY_ID = useProxy ? PROXY_API.UPDATE_BY_ID : WASHING_API.UPDATE_BY_ID;

  // 컴포넌트 마운트 시 분석 내역 데이터 불러오기
  useEffect(() => {
  const fetchHistory = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken"); // 또는 쿠키 등에서 가져오기
      const response = await axios.get(WASHING_GET_ALL, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      const apiData = response.data.data;

      // 프론트 표시 형식으로 매핑
      const formatted = apiData.map((item) => ({
        id: item.washingHistoryId,
        date: item.createdAt,
        type:
          item.analysisType === "LABEL"
            ? "라벨"
            : item.analysisType === "STAIN"
            ? "얼룩"
            : "얼룩과 라벨",
        result: item.analysis,
        imageUrl: null,
        feedback:
          item.estimation === null
            ? null
            : item.estimation === true
            ? "like"
            : "dislike",
      }));

      setHistoryItems(formatted);
    } catch (error) {
      console.error("내역을 불러오는데 실패했습니다:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchHistory();
}, []);

  // 피드백 업데이트 핸들러
  const handleFeedback = async (id, feedbackType) => {
  const token = localStorage.getItem("accessToken");

  const newEstimation =
    feedbackType === "like" ? true : feedbackType === "dislike" ? false : null;

  try {
    // PATCH 요청 보내기
    const response = await axios.patch(
      `${UPDATE_BY_ID}/${id}`, 
      { estimation: newEstimation },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
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
    } else {
      alert(response.data.error?.message || "평가에 실패했습니다.");
    }
  } catch (error) {
    console.error("피드백 전송 실패:", error);
    alert(
      error.response?.data?.error?.message ||
        "서버 오류로 평가를 저장할 수 없습니다."
    );
  }
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
