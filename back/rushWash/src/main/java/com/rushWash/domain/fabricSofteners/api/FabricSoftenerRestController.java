package com.rushWash.domain.fabricSofteners.api;

import com.rushWash.common.response.ApiResponse;
import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import com.rushWash.domain.fabricSofteners.api.dto.response.FabricSoftenerResponse;
import com.rushWash.domain.fabricSofteners.service.FabricSoftenerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/fabric-softeners")
@RequiredArgsConstructor
public class FabricSoftenerRestController {

    private final FabricSoftenerService fabricSoftenerService;

    @GetMapping("/{fabricScent}")
    public ApiResponse<List<FabricSoftenerResponse>> getFabricSoftenerList(
            @PathVariable("fabricScent") String fabricScent){

        List<FabricSoftenerResponse> response = fabricSoftenerService.getFabricSoftenerList(fabricScent);

        if (response == null || response.isEmpty()){
            throw new CustomException(ErrorCode.FABRIC_CATEGORY_NOT_FOUND);
        }

        return ApiResponse.ok(response);
    }

}
