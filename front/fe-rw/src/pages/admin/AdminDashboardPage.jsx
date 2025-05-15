import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminDashboardPage = () => {
  // 통계 데이터 상태
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalSofteners: 0,
    totalHistories: 0,
    recentHistories: [],
  });

  // 로딩 상태
  const [loading, setLoading] = useState(true);

  // 목업 데이터 로드 (실제로는 API 호출)
  useEffect(() => {
    // 실제 구현에서는 API 호출
    setTimeout(() => {
      setStats({
        totalUsers: 1245,
        verifiedUsers: 982,
        totalSofteners: 42,
        totalHistories: 5872,
        recentHistories: [
          {
            id: 1,
            user_id: "user123",
            analysis_type: "both",
            created_at: "2025-05-04",
            stain_category: "커피",
            estimation: true,
          },
          {
            id: 2,
            user_id: "cleanlover",
            analysis_type: "label",
            created_at: "2025-05-04",
            stain_category: null,
            estimation: true,
          },
          {
            id: 3,
            user_id: "washer99",
            analysis_type: "stain",
            created_at: "2025-05-03",
            stain_category: "와인",
            estimation: false,
          },
          {
            id: 4,
            user_id: "jenny2025",
            analysis_type: "both",
            created_at: "2025-05-03",
            stain_category: "과일",
            estimation: true,
          },
          {
            id: 5,
            user_id: "laundryexpert",
            analysis_type: "stain",
            created_at: "2025-05-02",
            stain_category: "잉크",
            estimation: true,
          },
        ],
        softenerCategories: [
          { category: "꽃 향", count: 15 },
          { category: "우디 향", count: 8 },
          { category: "시트러스 향", count: 6 },
          { category: "상쾌한 향", count: 7 },
          { category: "파우더 향", count: 4 },
          { category: "과일 향", count: 2 },
        ],
      });
      setLoading(false);
    }, 500);
  }, []);

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
              title="인증된 사용자"
              value={stats.verifiedUsers}
              icon={<i className="fas fa-user-check text-4xl"></i>}
              color="border-green-500"
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
                    {stats.recentHistories.map((history) => (
                      <tr key={history.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {history.user_id}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {history.analysis_type === "both"
                            ? "얼룩+라벨"
                            : history.analysis_type === "stain"
                            ? "얼룩"
                            : "라벨"}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {history.created_at}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          {history.estimation ? (
                            <span className="text-green-600">성공</span>
                          ) : (
                            <span className="text-red-600">실패</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 섬유유연제 카테고리 분포 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">향기 카테고리 분포</h2>
                <Link
                  to="/admin/scent-categories"
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  관리하기
                </Link>
              </div>

              <div className="space-y-4">
                {stats.softenerCategories &&
                  stats.softenerCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {category.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          {category.count}개
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
                  ))}
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      센스티브 섬유유연제
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      피죤
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        꽃 향
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      2025-05-04
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        수정
                      </a>
                      <a href="#" className="text-red-600 hover:text-red-900">
                        삭제
                      </a>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      옥시젠 퍼퓸
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      다우니
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        우디 향
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      2025-05-03
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        수정
                      </a>
                      <a href="#" className="text-red-600 hover:text-red-900">
                        삭제
                      </a>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      퓨어 시트러스
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      샤프란
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        시트러스 향
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      2025-05-02
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        수정
                      </a>
                      <a href="#" className="text-red-600 hover:text-red-900">
                        삭제
                      </a>
                    </td>
                  </tr>
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
