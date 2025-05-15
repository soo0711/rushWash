import React, { useEffect, useState, useRef } from "react";
import Header from "../../components/common/Header";
import { Link } from "react-router-dom";
//포트번호 3001번으로 실행해야 가능

const NearbyLaundryPage = () => {
  // 지도 관련 상태
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [closestShopId, setClosestShopId] = useState(null);

  // 검색어 상태 관리
  const [searchQuery, setSearchQuery] = useState("");

  // 세탁소 데이터 상태
  const [laundryShops, setLaundryShops] = useState([]);

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=6e9658d03169bf73d17ed79f91bfae8b&autoload=false&libraries=services`;

    script.onload = () => {
      console.log("카카오맵 스크립트 로드 완료");
      window.kakao.maps.load(() => {
        console.log("카카오맵 로드 완료");
        initializeMap();
      });
    };

    script.onerror = (e) => {
      console.error("카카오맵 스크립트 로드 실패:", e);
      setError("지도를 불러오는데 실패했습니다.");
      setLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 맵 생성 후 추가 relayout을 위한 useEffect 추가 (핵심 수정)
  useEffect(() => {
    if (map) {
      // 지도가 생성된 후 일정 시간 후에 여러 번 relayout 호출
      const times = [100, 300, 600, 1000, 1500];
      const timers = times.map((time) =>
        setTimeout(() => {
          console.log(`${time}ms 후 relayout 호출`);
          map.relayout();

          // 강제 resize 이벤트 발생시키기
          if (time === 600) {
            console.log("강제 resize 이벤트 발생");
            window.dispatchEvent(new Event("resize"));
          }
        }, time)
      );

      return () => timers.forEach((timer) => clearTimeout(timer));
    }
  }, [map]);

  // 지도 초기화
  const initializeMap = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });

          const container = mapRef.current;

          // 약간의 지연을 주어 DOM이 완전히 렌더링되도록 함
          setTimeout(() => {
            const options = {
              center: new window.kakao.maps.LatLng(lat, lng),
              level: 3,
            };

            const newMap = new window.kakao.maps.Map(container, options);
            newMap.relayout(); // 명시적으로 relayout 호출
            setMap(newMap);

            // 사용자 위치 마커 추가
            const userMarker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(lat, lng),
              map: newMap,
            });

            // 인포윈도우 표시
            const infowindow = new window.kakao.maps.InfoWindow({
              content:
                '<div style="padding:5px;font-size:14px;">현재 위치</div>',
            });
            infowindow.open(newMap, userMarker);

            // 주변 세탁소 검색
            searchNearbyLaundry(lat, lng, newMap);
          }, 2500);
        },
        (error) => {
          console.error("위치 정보를 가져오는데 실패했습니다:", error);
          setError(
            "위치 정보를 가져오는데 실패했습니다. 위치 권한을 허용해주세요."
          );
          setLoading(false);

          // 기본 위치(서울 시청)로 설정
          const defaultLat = 37.5665;
          const defaultLng = 126.978;
          setUserLocation({ lat: defaultLat, lng: defaultLng });

          const container = mapRef.current;
          setTimeout(() => {
            const options = {
              center: new window.kakao.maps.LatLng(defaultLat, defaultLng),
              level: 5,
            };

            const newMap = new window.kakao.maps.Map(container, options);
            newMap.relayout();
            setMap(newMap);

            // 위치 정보 실패 시 목업 데이터 표시
            setLaundryShops(getMockLaundryShops());
          }, 100);
        }
      );
    } else {
      setError("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
      setLoading(false);

      // 기본 위치(서울 시청)로 설정
      const defaultLat = 37.5665;
      const defaultLng = 126.978;
      setUserLocation({ lat: defaultLat, lng: defaultLng });

      const container = mapRef.current;
      setTimeout(() => {
        const options = {
          center: new window.kakao.maps.LatLng(defaultLat, defaultLng),
          level: 5,
        };

        const newMap = new window.kakao.maps.Map(container, options);
        newMap.relayout();
        setMap(newMap);

        // 위치 정보 지원 안 될 때 목업 데이터 표시
        setLaundryShops(getMockLaundryShops());
      }, 100);
    }
  };

  // 주변 세탁소 검색
  const searchNearbyLaundry = (lat, lng, map) => {
    const places = new window.kakao.maps.services.Places();

    const callback = function (result, status) {
      if (status === window.kakao.maps.services.Status.OK) {
        // API 결과 데이터 형식에 맞게 변환
        const formattedShops = result.map((shop) => ({
          id: shop.id,
          name: shop.place_name,
          rating: shop.rating || Math.floor(Math.random() * 3) + 2, // API에 없으면 랜덤 평점
          distance: shop.distance,
          address: shop.road_address_name || shop.address_name,
          lat: shop.y,
          lng: shop.x,
          phone: shop.phone,
          // 기타 필요한 데이터 매핑
        }));

        setLaundryShops(formattedShops);
        displayLaundryShops(result, map);
        setLoading(false);
      } else {
        console.error("검색 실패:", status);
        setError("주변 세탁소를 검색하는데 실패했습니다.");
        setLoading(false);
        // 검색 실패 시 목업 데이터 표시
        setLaundryShops(getMockLaundryShops());
      }
    };

    // 키워드로 장소 검색 - 세탁소 키워드와 현재 위치 중심으로 검색
    places.keywordSearch("세탁소", callback, {
      location: new window.kakao.maps.LatLng(lat, lng),
      radius: 2000,
      sort: window.kakao.maps.services.SortBy.DISTANCE,
    });
  };

  // 세탁소 마커 표시 및 가장 가까운 세탁소 선택
  const displayLaundryShops = (shops, map) => {
    const newMarkers = [];
    const bounds = new window.kakao.maps.LatLngBounds();

    // 사용자 위치도 경계에 포함
    if (userLocation) {
      bounds.extend(
        new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng)
      );
    }

    // 가장 가까운 세탁소를 찾기 위한 변수
    let closestShop = null;
    let minDistance = Infinity;

    shops.forEach((shop) => {
      const position = new window.kakao.maps.LatLng(shop.y, shop.x);

      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        map: map,
        position: position,
        title: shop.place_name,
      });

      // 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding:8px;width:220px;text-align:center;">
            <div style="font-weight:bold;font-size:16px;margin-bottom:6px;">${
              shop.place_name
            }</div>
            <div style="font-size:14px;">${
              shop.road_address_name || shop.address_name
            }</div>
            <div style="font-size:14px;">거리: ${shop.distance}m</div>
            ${
              shop.phone
                ? `<div style="font-size:14px;">전화: ${shop.phone}</div>`
                : ""
            }
          </div>
        `,
      });

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, "click", function () {
        // 다른 인포윈도우 모두 닫기
        newMarkers.forEach((m) => m.infowindow.close());

        // 현재 마커의 인포윈도우 열기
        infowindow.open(map, marker);
      });

      newMarkers.push({ marker, infowindow, shop });
      bounds.extend(position);

      // 가장 가까운 세탁소 확인
      const distance = parseInt(shop.distance);
      if (distance < minDistance) {
        minDistance = distance;
        closestShop = { marker, infowindow, shop };
      }
    });

    setMarkers(newMarkers);

    // 모든 마커가 보이도록 지도 범위 조정
    map.setBounds(bounds);

    // 가장 가까운 세탁소의 인포윈도우 자동으로 열기
    if (closestShop) {
      setTimeout(() => {
        closestShop.infowindow.open(map, closestShop.marker);

        // 해당 마커 좀 더 잘 보이게 애니메이션 효과 (바운스)
        // 마커가 이동하면서 주목을 끌게 함
        if (window.kakao.maps.Animation && window.kakao.maps.Animation.BOUNCE) {
          closestShop.marker.setAnimation(window.kakao.maps.Animation.BOUNCE);
          setTimeout(() => {
            closestShop.marker.setAnimation(null);
          }, 2500); // 2.1초 후 애니메이션 중지
        }

        // 목록에서도 해당 세탁소 강조 표시
        setClosestShopId(closestShop.shop.id || closestShop.shop.place_name);
      }, 500);
    }
  };

  // 검색 처리
  const handleSearch = () => {
    if (!map || !userLocation || !searchQuery.trim()) return;

    const places = new window.kakao.maps.services.Places();

    const callback = function (result, status) {
      if (status === window.kakao.maps.services.Status.OK) {
        // API 결과 데이터 형식에 맞게 변환
        const formattedShops = result.map((shop) => ({
          id: shop.id,
          name: shop.place_name,
          rating: shop.rating || Math.floor(Math.random() * 3) + 2, // API에 없으면 랜덤 평점
          distance: shop.distance,
          address: shop.road_address_name || shop.address_name,
          lat: shop.y,
          lng: shop.x,
          phone: shop.phone,
        }));

        setLaundryShops(formattedShops);

        // 기존 마커 제거
        markers.forEach((marker) => {
          marker.marker.setMap(null);
          marker.infowindow.close();
        });

        // 새 마커 표시
        displayLaundryShops(result, map);
      } else {
        console.error("검색 실패:", status);
        alert("검색 결과가 없습니다.");
      }
    };

    // 키워드로 장소 검색 - 입력된 검색어와 세탁소를 함께 검색
    places.keywordSearch(`${searchQuery} 세탁소`, callback, {
      location: new window.kakao.maps.LatLng(
        userLocation.lat,
        userLocation.lng
      ),
      radius: 5000, // 검색 시에는 더 넓은 반경 설정
      sort: window.kakao.maps.services.SortBy.DISTANCE,
    });
  };

  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Enter 키 핸들러
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 목업 데이터 함수
  const getMockLaundryShops = () => {
    return [
      {
        id: 1,
        name: "더런드리 가양점",
        rating: 3.0,
        distance: "413",
        address: "서울시 강서구 가양동",
        imageUrl: null,
      },
      {
        id: 2,
        name: "크린토피아 가양강변점",
        rating: 3.0,
        distance: "593",
        address: "서울시 강서구 가양동",
        imageUrl: null,
      },
      {
        id: 3,
        name: "깨끗한나라 가양점",
        rating: 3.0,
        distance: "613",
        address: "서울시 강서구 가양동",
        imageUrl: null,
      },
      {
        id: 4,
        name: "세탁명가 가양점",
        rating: 4.0,
        distance: "750",
        address: "서울시 강서구 가양동",
        imageUrl: null,
      },
      {
        id: 5,
        name: "스피드세탁 방화점",
        rating: 4.5,
        distance: "890",
        address: "서울시 강서구 방화동",
        imageUrl: null,
      },
    ];
  };

  // 거리 포맷팅 함수
  const formatDistance = (meters) => {
    const distance = parseInt(meters);
    if (distance < 1000) {
      return `${distance}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  // 별점 렌더링 함수
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        <span className="text-xl mr-1 font-semibold">{rating.toFixed(1)}</span>
        <div className="flex text-xl">
          {[...Array(fullStars)].map((_, i) => (
            <span key={`full-${i}`} className="text-yellow-500">
              ★
            </span>
          ))}
          {halfStar && <span className="text-yellow-500">★</span>}
          {[...Array(emptyStars)].map((_, i) => (
            <span key={`empty-${i}`} className="text-gray-300">
              ★
            </span>
          ))}
        </div>
      </div>
    );
  };

  // 세탁소 아이템 클릭 핸들러
  const handleShopItemClick = (shop) => {
    if (map && markers.length > 0) {
      // 해당 세탁소를 마커 배열에서 찾기
      const markerItem = markers.find(
        (marker) =>
          marker.shop.id === shop.id || marker.shop.place_name === shop.name
      );

      if (markerItem) {
        // 다른 인포윈도우 모두 닫기
        markers.forEach((m) => m.infowindow.close());

        // 현재 마커의 인포윈도우 열기
        markerItem.infowindow.open(map, markerItem.marker);

        // 지도 중심 이동
        map.setCenter(markerItem.marker.getPosition());
        map.setLevel(3); // 줌 레벨 조정
      }
    }

    // 여기에 세탁소 상세 페이지로 이동하는 로직 추가 가능
    // 예: history.push(`/laundry/${shop.id}`);
  };

  // 지도 크기 재조정을 위한 함수
  useEffect(() => {
    const handleResize = () => {
      if (map) {
        // 지도 영역이 변경되었을 때 지도 객체에 알림
        map.relayout();

        // 현재 표시 중인 마커들이 모두 보이도록 지도 범위 재설정
        if (markers.length > 0) {
          const bounds = new window.kakao.maps.LatLngBounds();

          if (userLocation) {
            bounds.extend(
              new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng)
            );
          }

          markers.forEach((marker) => {
            bounds.extend(marker.marker.getPosition());
          });

          map.setBounds(bounds);
        }
      }
    };

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener("resize", handleResize);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [map, markers, userLocation]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 sandol-font text-base md:text-lg lg:text-xl">
      <Header />

      <div className="container mx-auto px-4 py-2 flex-grow flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-grow flex flex-col">
          {/* 검색 바 */}
          <div className="bg-[#B7F3FF] p-4 shadow-md mt-3 rounded-lg">
            <div className="relative">
              <input
                type="text"
                placeholder="세탁소 검색..."
                className="w-full px-4 py-3 pr-10 text-lg md:text-xl rounded-full border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
              />
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
                onClick={handleSearch}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          {/* 메인 콘텐츠 영역 - 큰 화면에서 지도와 목록 나란히 배치 */}
          <div className="mt-3 flex flex-col lg:flex-row gap-4 flex-grow">
            {/* 지도 영역 - 큰 화면에서 왼쪽 배치 */}
            <div className="lg:w-3/5 rounded-lg overflow-hidden shadow-md lg:h-auto flex-shrink-0">
              <div
                ref={mapRef}
                className="w-full h-64 sm:h-80 md:h-96 lg:h-full min-h-80"
                style={{
                  display: loading || error ? "none" : "block",
                  height: "400px", // 명시적 높이 지정
                  width: "100%", // 명시적 너비 지정
                }}
              ></div>

              {/* 로딩 상태 */}
              {loading && (
                <div className="flex justify-center items-center h-64 sm:h-80 md:h-96 bg-gray-100">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}

              {/* 에러 메시지 */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 h-64 sm:h-80 md:h-96 flex items-center justify-center text-lg md:text-xl">
                  <p>{error}</p>
                </div>
              )}
            </div>

            {/* 세탁소 목록 영역 - 큰 화면에서 오른쪽 배치, 작은 화면에서는 고정 높이로 스크롤 */}
            <div className="lg:w-2/5 flex flex-col flex-grow overflow-hidden">
              {/* 가까운 세탁소 텍스트 */}
              <div className="px-4 py-4 border-b bg-white rounded-t-lg flex-shrink-0">
                <h2 className="text-2xl md:text-3xl font-bold text-blue-800">
                  가까운 세탁소
                </h2>
              </div>

              {/* 세탁소 목록 - 모든 화면 크기에서 스크롤 가능하도록 설정 */}
              <div className="divide-y bg-white shadow-md rounded-b-lg overflow-hidden flex-grow overflow-y-auto">
                {laundryShops.length > 0 ? (
                  laundryShops.map((shop) => (
                    <div
                      key={shop.id}
                      className={`p-5 flex items-center hover:bg-blue-50 transition-colors duration-200 cursor-pointer ${
                        closestShopId === shop.id || closestShopId === shop.name
                          ? "bg-blue-100 border-l-4 border-blue-500"
                          : ""
                      }`}
                      onClick={() => handleShopItemClick(shop)}
                    >
                      {/* 지도 마커 이미지 */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0 mr-5 shadow-md border-2 border-white">
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 drop-shadow-md"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* 세탁소 정보 */}
                      <div className="flex-grow">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-blue-900">
                          {shop.name}
                        </h3>
                        <div className="flex items-center">
                          {renderStars(shop.rating)}
                        </div>
                        <p className="text-gray-600 text-lg flex items-center mt-2">
                          <svg
                            className="w-5 h-5 mr-1 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            ></path>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            ></path>
                          </svg>
                          <span className="font-medium text-blue-700">
                            {formatDistance(shop.distance)}
                          </span>
                          <span className="mx-2">·</span>
                          <span className="truncate">{shop.address}</span>
                        </p>
                      </div>

                      {/* 화살표 아이콘 (상세 페이지로 이동) */}
                      <div className="ml-2 text-gray-400">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  ))
                ) : !loading && !error ? (
                  <div className="p-6 text-center text-gray-500 text-xl">
                    주변에 세탁소가 없습니다.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 페이지 최소 높이를 위한 하단 여백 */}
      <div className="pb-4"></div>
    </div>
  );
};

export default NearbyLaundryPage;
