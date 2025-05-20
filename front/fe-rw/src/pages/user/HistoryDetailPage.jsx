import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import { WASHING_API, PROXY_API, useProxy } from "../../constants/api";
import axios from "axios";

const HistoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // API URL 설정
  const WASHING_GET_BY_ID = useProxy
    ? `${PROXY_API.BASE_URL}/washings` // 프록시 API URL
    : `/washings`; // 직접 API URL

  useEffect(() => {
    const fetchHistoryDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        // API 호출 시 Path Variable 방식으로 ID 전달
        const response = await axios.get(`${WASHING_GET_BY_ID}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setDetail(response.data.data);
        } else {
          setError(
            response.data.error?.message || "데이터를 불러올 수 없습니다."
          );
        }
      } catch (error) {
        console.error("상세 내역을 불러오는데 실패했습니다:", error);
        setError(
          error.response?.data?.error?.message ||
            "서버 오류로 상세 내역을 불러올 수 없습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHistoryDetail();
    }
  }, [id, WASHING_GET_BY_ID]);

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  // 분석 유형 표시 함수
  const getAnalysisTypeText = (type) => {
    switch (type) {
      case "LABEL":
        return "라벨";
      case "STAIN":
        return "얼룩";
      case "LABEL_AND_STAIN":
        return "얼룩과 라벨";
      default:
        return type;
    }
  };

  // 뒤로가기 핸들러
  const handleGoBack = () => {
    navigate(-1);
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

  if (error) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
        <Header />
        <div className="container mx-auto max-w-md px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 text-xl mb-4">{error}</p>
            <button
              onClick={handleGoBack}
              className="text-blue-500 hover:underline"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
        <Header />
        <div className="container mx-auto max-w-md px-4 py-8">
          <div className="text-center">
            <p className="text-xl mb-4">분석 정보를 찾을 수 없습니다.</p>
            <button
              onClick={handleGoBack}
              className="text-blue-500 hover:underline"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font">
      <Header />

      <div className="container mx-auto max-w-md px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={handleGoBack}
            className="text-blue-500 hover:underline flex items-center"
          >
            <span className="mr-1">←</span> 목록으로
          </button>
          <h1 className="text-2xl font-bold text-center flex-grow">
            분석 상세 내역
          </h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <p className="text-gray-500 text-sm">
              {formatDate(detail.createdAt)}
            </p>
            <h2 className="text-2xl font-semibold mb-4">
              {getAnalysisTypeText(detail.analysisType)} 분석
            </h2>
          </div>

          {/* 이미지 영역 */}
          <div className="mb-6 space-y-4">
            {detail.analysisType === "LABEL" ||
            detail.analysisType === "LABEL_AND_STAIN" ? (
              <div>
                <h3 className="text-lg font-medium mb-2">라벨 이미지</h3>
                <img
                  src={detail.labelImageUrl}
                  alt="라벨 이미지"
                  className="w-full rounded-lg shadow-sm"
                />
              </div>
            ) : null}

            {detail.analysisType === "STAIN" ||
            detail.analysisType === "LABEL_AND_STAIN" ? (
              <div>
                <h3 className="text-lg font-medium mb-2">얼룩 이미지</h3>
                <img
                  src={detail.stainImageUrl}
                  alt="얼룩 이미지"
                  className="w-full rounded-lg shadow-sm"
                />
              </div>
            ) : null}
          </div>

          {/* 분석 결과 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">분석 결과</h3>
            <p className="text-gray-800 text-lg p-4 bg-gray-50 rounded-lg">
              {detail.analysis}
            </p>
          </div>

          {/* 얼룩 유형 */}
          {detail.stainCategory && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">얼룩 유형</h3>
              <p className="text-gray-800 font-medium">
                {detail.stainCategory}
              </p>
            </div>
          )}

          {/* 피드백 상태 */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-2">피드백 상태</h3>
            <p className="flex items-center">
              {detail.estimation === true ? (
                <span className="text-blue-500 flex items-center">
                  <span className="mr-2">👍</span> 도움이 되었어요
                </span>
              ) : detail.estimation === false ? (
                <span className="text-red-500 flex items-center">
                  <span className="mr-2">👎</span> 도움이 되지 않았어요
                </span>
              ) : (
                <span className="text-gray-500">아직 피드백이 없습니다</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryDetailPage;
