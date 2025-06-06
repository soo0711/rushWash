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

    // input: File 원본, userLoginId(폴더명)		output: 이미지 경로
    // List 여러 파일
    public List<String> saveFile(String userId, List<MultipartFile> files) {
        String directoryName = userId + "_" + System.currentTimeMillis();
        String filePath = uploadPath + "/images/" + directoryName;

        File directory = new File(filePath);

        if (directory.mkdir() == false) {
            return null;
        }

        List<String> images = new ArrayList<>();

        try {
            for (MultipartFile file : files) {
                byte[] bytes = file.getBytes();
                Path path = Paths.get(filePath + "/" + file.getOriginalFilename());
                Files.write(path, bytes); // 파일 업로드
                images.add("/images/" + directoryName + "/" + file.getOriginalFilename());
            }
        } catch (IOException e) {
            throw new CustomException(ErrorCode.FILE_UPLOAD_FAILED);
        }

        // http://localhost/images/aaaa_1234354/gg.png
        return images;
    }


    // input: imgPath 	output: X
    public void deleteFile(List<String> imagePaths) {
        for (String imagePath : imagePaths) {
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

        // 폴더 지우기
        Path paths = Paths.get(uploadPath + imagePaths.get(0)).getParent();
        if (Files.exists(paths)) {
            try {
                Files.delete(paths);
            } catch (IOException e) {
                throw new CustomException(ErrorCode.DIRECTORY_DELETE_FAILED);
            }
        }
    }

    // 단일 파일
    public String saveFile(String userId, MultipartFile file) {
        String directoryName = userId + "_" + System.currentTimeMillis();
        String filePath = uploadPath + "/images/" + directoryName;

        File directory = new File(filePath);
        if (!directory.mkdir()) {
            return null;
        }

        try {
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isBlank()) {
                return null;
            }
            byte[] bytes = file.getBytes();
            Path path = Paths.get(filePath, originalFilename);
            Files.write(path, bytes); // 실제 파일 업로드
        } catch (IOException e) {
            e.printStackTrace();
            // 필요 시 예외 던지기
            return null;
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

}
