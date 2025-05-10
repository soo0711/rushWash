import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header
      className="flex justify-between items-center p-3 w-full"
      style={{ backgroundColor: "#B7F3FF" }}
    >
      <div className="container mx-auto flex justify-between items-center px-4 max-w-6xl">
        <div>
          <Link to="/">
            <img
              src={require("../../assets/images/logo.png")}
              alt="빨랑 빨래 로고"
              className="h-12 md:h-16"
            />
          </Link>
        </div>
        <div className="text-lg md:text-xl">
          <Link to="/signup" className="cursor-pointer">
            회원가입
          </Link>
          <span className="mx-2">|</span>
          <Link to="/login" className="cursor-pointer">
            로그인
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
