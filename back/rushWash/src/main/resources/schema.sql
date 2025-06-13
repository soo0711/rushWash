CREATE DATABASE IF NOT EXISTS db25119 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE db25119;

CREATE TABLE user
(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  password VARCHAR(512) NOT NULL,
  email VARCHAR(128) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE washing_history
(
id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
analysis_type ENUM('STAIN', 'LABEL_AND_STAIN', 'LABEL') NOT NULL,
stain_image_url VARCHAR(512),
label_image_url VARCHAR(512),
estimation BOOLEAN,
created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE washing_result
(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    washing_history_id INT NOT NULL,
    stain_category VARCHAR(32),
    analysis TEXT NOT NULL,
    CONSTRAINT fk_washing_history
    FOREIGN KEY (washing_history_id)
    REFERENCES washing_history(id)
    ON DELETE CASCADE
);

CREATE TABLE fabric_softener
(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  scent_category VARCHAR(32) NOT NULL,
  brand VARCHAR(30) NOT NULL,
  product_name VARCHAR(30) NOT NULL,
  image_url VARCHAR(256) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE verification
(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email varchar(128) NOT NULL,
    verify_code INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO fabric_softener (scent_category, brand, product_name, image_url) VALUES
('refreshing', '다우니', '엑스퍼트 실내건조 프레시클린', '/images/refreshing/downy_001.jpg'),
('refreshing', '피죤', '써니가든', '/images/refreshing/pigeon_002.jpg'),
('refreshing', '샤프란', '릴렉싱아로마', '/images/refreshing/shafran_003.jpg'),

('floral', '다우니', '오리지널(에이프릴 프레쉬)', '/images/floral/downy_001.jpg'),
('floral', '아우라', '윌유메리미', '/images/floral/aura_002.jpg'),
('floral', '피죤', '핑크로즈', '/images/floral/pigeon_003.jpg'),

('woody', '아우라', '스모키머스크', '/images/woody/aura_001.jpg'),
('woody', '스너글', '블루스파크', '/images/woody/snuggle_002.jpg'),
('woody', '칸토', '고농축 깊은 우디향(크림퍼플)', '/images/woody/canto_003.jpg'),

('powdery', '아우라', '베이비머스크', '/images/powdery/aura_001.jpg'),
('powdery', '스너글', '허거블 코튼', '/images/powdery/snuggle_002.jpg'),
('powdery', '다우니', '엑스퍼트 실내건조 파우더향', '/images/powdery/downy_003.jpg'),

('citrus', '다우니', '시트러스 앤 버베나', '/images/citrus/downy_001.png'),
('citrus', '스너글', '스파클링 시트러스', '/images/citrus/snuggle_002.jpg'),
('citrus', '블랑101', '세이지 가든', '/images/citrus/blanc101_003.jpg'),

('fruity', '다우니', '핑크 베리베리와 바닐라', '/images/fruity/downy_001.jpg'),
('fruity', '피죤', '보타닉 애플 밤', '/images/fruity/pigeon_002.png'),
('fruity', '베베스킨', '러블리 피치', '/images/fruity/bebeskin_003.jpg');