import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import axios from "axios";
import { ADMIN_API, PROXY_API } from "../../constants/api";

const AdminDashboardPage = () => {
  const DASHBOARD = ADMIN_API.DASHBOARD;
  // 통계 데이터 상태
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalSofteners: 0,
    totalHistories: 0,
    recentHistories: [],
    softenerCategories: [],
    recentSofteners: [],
  });

  // 로딩 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // API에서 데이터 로드
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 대시보드 데이터 API 호출 (단일 엔드포인트로 변경)
        const dashboardResponse = await axios.get(DASHBOARD);

        if (dashboardResponse.data.success) {
          const data = dashboardResponse.data.data;

          // 최근 분석 내역 처리
          const recentHistories = data.washingHistory ? data.washingHistory.map((item) => ({
            id: item.washingHistoryId,
            user_id: item.userEmail,
            analysis_type: item.analysisType.toLowerCase(),
            created_at: formatDate(item.createdAt),
            estimation: item.estimation,
          })) : [];

          // 섬유유연제 목록 처리
          const recentSofteners = data.fabricSoftenerList ? data.fabricSoftenerList
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3)
            .map((item) => ({
              id: item.id,
              name: item.productName || "이름 없음",
              brand: item.brand || "브랜드 없음",
              scent_category: item.scentCategory,
              created_at: formatDate(item.createdAt),
            })) : [];

          // 향기 카테고리 분포 처리 (API에서 직접 제공되는 scentCount 사용)
          const softenerCategories = data.scentCount ? Object.keys(data.scentCount).map((category) => ({
            category: category,
            count: data.scentCount[category],
          })) : [];

          // 카테고리 개수 기준으로 내림차순 정렬
          softenerCategories.sort((a, b) => b.count - a.count);

          // 상태 업데이트
          setStats({
            totalUsers: data.userCount || 0,
            verifiedUsers: data.userCount || 0, // API에 별도 필드가 없으므로 동일하게 설정
            totalSofteners: data.fabricSoftenerCount || 0,
            totalHistories: data.washingHistoryCount || 0,
            recentHistories: recentHistories,
            softenerCategories: softenerCategories,
            recentSofteners: recentSofteners,
          });
        } else {
          throw new Error(dashboardResponse.data.error?.message || "데이터를 불러올 수 없습니다.");
        }
      } catch (err) {
        console.error("API 호출 오류:", err);
        setError("서버 오류로 데이터를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // 분석 유형 표시 함수
  const getAnalysisTypeText = (type) => {
    switch (type.toLowerCase()) {
      case "label":
        return "라벨";
      case "stain":
        return "얼룩";
      case "label_and_stain":
      case "both":
        return "얼룩+라벨";
      default:
        return type;
    }
  };

  // 향기 카테고리 한글 변환 함수
  const getScentCategoryText = (category) => {
    const categoryMap = {
      'floral': '플로럴',
      'refreshing': '상쾌한',
      'woody': '우디',
      'fruity': '과일',
      'powdery': '파우더',
      'citrus': '시트러스'
    };
    return categoryMap[category] || category;
  };

  // 통계 카드 컴포넌트
  const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
        </div>
        <div className={`text-${color.replace("border-", "")} opacity-80`}>
          {icon}
        </div>
      </div>
    </div>
  );

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

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-red-500 text-xl mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 사이드바 컴포넌트 사용 */}
      <AdminSidebar />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 바 */}
        <header className="bg-white shadow-sm">
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">대시보드</h1>
            <div className="flex items-center">
              <div className="relative mr-4">
                <button className="text-gray-500 hover:text-gray-700">
                  <i className="fas fa-bell text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 대시보드 컨텐츠 */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="총 사용자 수"
              value={stats.totalUsers}
              icon={<i className="fas fa-users text-4xl"></i>}
              color="border-blue-500"
            />
            <StatCard
              title="섬유유연제 제품 수"
              value={stats.totalSofteners}
              icon={<i className="fas fa-shopping-basket text-4xl"></i>}
              color="border-yellow-500"
            />
            <StatCard
              title="총 분석 횟수"
              value={stats.totalHistories}
              icon={<i className="fas fa-chart-line text-4xl"></i>}
              color="border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 최근 분석 내역 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">최근 분석 내역</h2>
                <Link
                  to="/admin/washing-histories"
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  모두 보기
                </Link>
              </div>

              <div className="overflow-y-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용자 ID
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        분석 유형
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        등록일
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        추천 성공
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentHistories.length > 0 ? (
                      stats.recentHistories.map((history) => (
                        <tr key={history.id} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {history.user_id}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getAnalysisTypeText(history.analysis_type)}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            {history.created_at}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm">
                            {history.estimation === true ? (
                              <span className="text-green-600">성공</span>
                            ) : history.estimation === false ? (
                              <span className="text-red-600">실패</span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-3 py-4 text-center text-sm text-gray-500"
                        >
                          최근 분석 내역이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 섬유유연제 카테고리 분포 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">향기 카테고리 분포</h2>
              </div>

              <div className="space-y-4">
                {stats.softenerCategories &&
                stats.softenerCategories.length > 0 ? (
                  stats.softenerCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {getScentCategoryText(category.category)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {category.count}개 (
                          {Math.round(
                            (category.count / stats.totalSofteners) * 100
                          )}
                          %)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            index % 6 === 0
                              ? "bg-blue-500"
                              : index % 6 === 1
                              ? "bg-green-500"
                              : index % 6 === 2
                              ? "bg-yellow-500"
                              : index % 6 === 3
                              ? "bg-purple-500"
                              : index % 6 === 4
                              ? "bg-pink-500"
                              : "bg-indigo-500"
                          }`}
                          style={{
                            width: `${
                              (category.count / stats.totalSofteners) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-gray-500 py-4">
                    등록된 향기 카테고리가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 최근 등록된 섬유유연제 */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">최근 등록된 섬유유연제</h2>
              <Link
                to="/admin/fabric-softeners"
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                모두 보기
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제품명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      브랜드
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      향기 카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      등록일
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentSofteners && stats.recentSofteners.length > 0 ? (
                    stats.recentSofteners.map((softener) => (
                      <tr key={softener.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {softener.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {softener.brand}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              softener.scent_category === "floral"
                                ? "bg-green-100 text-green-800"
                                : softener.scent_category === "woody"
                                ? "bg-purple-100 text-purple-800"
                                : softener.scent_category === "citrus"
                                ? "bg-yellow-100 text-yellow-800"
                                : softener.scent_category === "refreshing"
                                ? "bg-blue-100 text-blue-800"
                                : softener.scent_category === "powdery"
                                ? "bg-pink-100 text-pink-800"
                                : softener.scent_category === "fruity"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {getScentCategoryText(softener.scent_category) || "분류 없음"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {softener.created_at}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        최근 등록된 섬유유연제가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;