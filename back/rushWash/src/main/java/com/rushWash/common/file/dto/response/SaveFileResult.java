package com.rushWash.common.file.dto.response;

public record SaveFileResult(
        String savedFilePath,
        String absoluteFilePath
) {
}
