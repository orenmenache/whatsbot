DROP DATABASE IF EXISTS `bob_db`;
CREATE DATABASE `bob_db`; 
USE `bob_db`;

CREATE TABLE `orders` (
  `orderId` int NOT NULL AUTO_INCREMENT,
  `orderDate` date NOT NULL,
  `clientName` varchar(50) NOT NULL,
  `clientEmail` varchar(70) NOT NULL,
  `bdpName` varchar(50) NOT NULL,
  `bdpGender` varchar(10) NOT NULL,
  `bdpAge` int DEFAULT NULL,
  `mentionAge` varchar(3) NOT NULL DEFAULT 'YES',
  `bdpQuality` varchar(10) NOT NULL,
  `status` varchar(10) NOT NULL DEFAULT 'OPEN',
  PRIMARY KEY (`orderId`)
)
