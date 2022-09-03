DROP DATABASE IF EXISTS `bob_db`;
CREATE DATABASE `bob_db`; 
USE `bob_db`;

SET NAMES utf8 ;
SET character_set_client = utf8mb4 ;

CREATE TABLE `orders` (
  `order_id` int(10) NOT NULL AUTO_INCREMENT,
  `order_date` date NOT NULL,
  `client_name` varchar(50) NOT NULL,
  `client_email` varchar(70) NOT NULL,
  `bdp_name` varchar(50) NOT NULL,
  `bdp_gender` varchar(10) NOT NULL,
  `bdp_age` int(3) NOT NULL,
  `bdp_quality` varchar(10) NOT NULL,
  `status` varchar(10) NOT NULL SET DEFAULT "OPEN",
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
