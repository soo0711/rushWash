package com.rushWash.common.file;

import com.rushWash.common.response.CustomException;
import com.rushWash.common.response.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Component
public class FileManagerService {

    private final String uploadPath;

    public FileManagerService(@Value("${file.upload-path}") String uploadPath) {
        this.uploadPath = uploadPath;
    }

    // 단일 파일
    public String saveFile(int userId, MultipartFile file) {
        String directoryName = userId + "_" + System.currentTimeMillis();
        String filePath = uploadPath + "/images/" + directoryName;

        File directory = new File(filePath);
        if (!directory.mkdir()) {
            throw new CustomException(ErrorCode.DIRECTORY_CREATION_FAILED);
        }

        try {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isBlank()) {
                throw new CustomException(ErrorCode.INVALID_FILE_NAME);
            }
            byte[] bytes = file.getBytes();
            Path path = Paths.get(filePath, originalFilename);
            Files.write(path, bytes); // 실제 파일 업로드
        } catch (IOException e) {
            e.printStackTrace();
            throw new CustomException(ErrorCode.FILE_UPLOAD_FAILED);
        }

        return "/images/" + directoryName + "/" + file.getOriginalFilename();
    }

    // input: ImagePath		output: void
    public void deleteFile(String imagePath) { ///images/sooo_1706159478390/gg.jpg
        Path path = Paths.get(uploadPath + imagePath);

        // 삭제할 이미지 존재?
        if (Files.exists(path)) {
            try {
                Files.delete(path);
            } catch (IOException e) {
                throw new CustomException(ErrorCode.FILE_DELETE_FAILED);
            }

            // 폴더 (디렉토리) 삭제
            path = path.getParent();
            if (Files.exists(path)) {
                try {
                    Files.delete(path);
                } catch (IOException e) {
                    throw new CustomException(ErrorCode.DIRECTORY_DELETE_FAILED);
                }
            }
        }
    }

    public void deleteFabricSoftenerFile(String imagePath) { ///images/sooo_1706159478390/gg.jpg
        Path path = Paths.get(uploadPath + imagePath);

        // 삭제할 이미지 존재?
        if (Files.exists(path)) {
            try {
                Files.delete(path);
            } catch (IOException e) {
                throw new CustomException(ErrorCode.FILE_DELETE_FAILED);
            }
        }
    }

    // 섬유유연제 이미지 저장
    public String saveFile(String scentCategory, MultipartFile file) {
        String filePath = uploadPath + "/images/" + scentCategory;

        File directory = new File(filePath);

        if (!directory.exists()) {
            if (!directory.mkdirs()) {
                throw new CustomException(ErrorCode.DIRECTORY_CREATION_FAILED);
            }
        }
        String originalFilename = "";
        try {
            originalFilename = System.currentTimeMillis()+ "_" + file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isBlank()) {
                throw new CustomException(ErrorCode.INVALID_FILE_NAME);
            }
            byte[] bytes = file.getBytes();
            Path path = Paths.get(filePath, originalFilename);
            Files.write(path, bytes); // 실제 파일 업로드
        } catch (IOException e) {
            e.printStackTrace();
            throw new CustomException(ErrorCode.FILE_UPLOAD_FAILED);
        }

        return "/images/" + scentCategory + "/" + originalFilename;
    }

}
