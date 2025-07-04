package com.rushWash.global.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WebController {

    @RequestMapping(value = {
            "/",  // 메인

            // 인증 관련
            "/signup",
            "/login",
            "/find-email",
            "/find-password",
            "/reset-password",

            // 분석 관련
            "/analyze",
            "/analyze/both",
            "/analyze/stain",
            "/analyze/label",
            "/analyze/result/**",  // /analyze/result/:analysisType

            // 기타 기능
            "/history",
            "/history/**",  // /history/:id
            "/fabricsoftener",
            "/fabricsoftener/result/**",
            "/laundry-map",

            // 관리자 페이지
            "/admin",
            "/admin/dashboard",
            "/admin/users",
            "/admin/fabric-softeners",
            "/admin/washing-histories",
            "/admin/ai",
            "/admin/stain-removal"
    })
    public String forward() {
        return "forward:/index.html";
    }

    @GetMapping({"/", "/error"})
    public String index() {
        return "index.html";
    }
}
