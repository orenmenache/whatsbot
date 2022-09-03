DROP DATABASE IF EXISTS `bob_db`;
CREATE DATABASE `bob_db`; 
USE `bob_db`;

SET NAMES utf8 ;
SET character_set_client = utf8mb4 ;

CREATE TABLE `orders` (
  `orderId` int(10) NOT NULL AUTO_INCREMENT,
  `orderDate` date NOT NULL,
  `clientName` varchar(50) NOT NULL,
  `clientEmail` varchar(70) NOT NULL,
  `bdpName` varchar(50) NOT NULL,
  `bdpGender` varchar(10) NOT NULL,
  `bdpAge` int(3) NOT NULL,
  `bdpQuality` varchar(10) NOT NULL,
  `status` varchar(10) NOT NULL DEFAULT "OPEN",
  PRIMARY KEY (`orderId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
