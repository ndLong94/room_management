package com.management.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackReplyRequest {

    @NotBlank(message = "Nội dung phản hồi không được để trống")
    @Size(max = 2000, message = "Nội dung tối đa 2000 ký tự")
    private String content;
}
