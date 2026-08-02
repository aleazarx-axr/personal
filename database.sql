-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: wmsu_portal
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `academicdates`
--

DROP TABLE IF EXISTS `academicdates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `academicdates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `target_audience` varchar(255) DEFAULT NULL,
  `event_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academicdates`
--

LOCK TABLES `academicdates` WRITE;
/*!40000 ALTER TABLE `academicdates` DISABLE KEYS */;
/*!40000 ALTER TABLE `academicdates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activitylogs`
--

DROP TABLE IF EXISTS `activitylogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activitylogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `details` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `activitylogs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `activitylogs_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activitylogs`
--

LOCK TABLES `activitylogs` WRITE;
/*!40000 ALTER TABLE `activitylogs` DISABLE KEYS */;
INSERT INTO `activitylogs` VALUES (1,5,NULL,'User Login','Ryan Christ logged in successfully','2026-08-01 03:18:02'),(2,2,NULL,'User Login','System logged in successfully','2026-08-01 03:18:22'),(3,5,NULL,'User Login','Ryan Christ logged in successfully','2026-08-01 03:19:31'),(4,NULL,NULL,'User Created','Created account for john.cruz (john.cruz.test1@example.com)','2026-08-01 03:38:55'),(5,NULL,NULL,'User Created','Created account for johnmark.cruz (john.cruz.test2@example.com)','2026-08-01 03:38:55'),(6,NULL,NULL,'User Created','Created account for johnmark.cruz1 (john.cruz.test3@example.com)','2026-08-01 03:38:56'),(7,2,NULL,'User Login','System logged in successfully','2026-08-01 03:40:29'),(8,NULL,NULL,'User Created','Created account for aleazarjohn.villanueva (aleazarvillanueva441@gmail.com)','2026-08-01 03:41:01'),(9,10,NULL,'Password Setup','User successfully set their initial password','2026-08-01 03:41:56'),(10,10,NULL,'User Login','Aleazar John logged in successfully','2026-08-01 03:42:23'),(11,2,NULL,'User Login','System logged in successfully','2026-08-01 03:42:44'),(12,NULL,NULL,'User Created','Created account for mark.fajiculay (elyxxvi@gmail.com)','2026-08-01 03:43:53'),(13,11,NULL,'Password Setup','User successfully set their initial password','2026-08-01 03:57:21'),(14,NULL,NULL,'Password Reset Requested','Sent reset link to aleazarjohnvillanueva@gmail.com','2026-08-01 04:33:38'),(15,6,NULL,'Password Setup','User successfully set their initial password','2026-08-01 04:34:11'),(16,6,NULL,'User Login','Aleazar logged in successfully','2026-08-01 04:34:25'),(17,2,NULL,'User Login','System logged in successfully','2026-08-01 04:34:41'),(18,2,NULL,'User Login','System logged in successfully','2026-08-01 05:00:56'),(19,6,NULL,'User Login','Aleazar logged in successfully','2026-08-01 05:18:32'),(20,2,NULL,'User Login','System logged in successfully','2026-08-01 05:30:21'),(21,2,NULL,'User Login','System logged in successfully','2026-08-01 06:20:51'),(22,2,NULL,'User Login','System logged in successfully','2026-08-01 06:26:55'),(23,2,NULL,'User Login','System logged in successfully','2026-08-01 06:45:50'),(24,6,NULL,'User Login','Aleazar logged in successfully','2026-08-01 06:48:31'),(25,2,NULL,'User Login','System logged in successfully','2026-08-01 06:51:06'),(26,2,NULL,'User Login','System logged in successfully','2026-08-01 06:54:58'),(27,6,NULL,'User Login','Aleazar logged in successfully','2026-08-01 06:55:34'),(28,2,NULL,'User Login','System logged in successfully','2026-08-02 01:45:27');
/*!40000 ALTER TABLE `activitylogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `administrators`
--

DROP TABLE IF EXISTS `administrators`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrators` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `rank_order` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrators`
--

LOCK TABLES `administrators` WRITE;
/*!40000 ALTER TABLE `administrators` DISABLE KEYS */;
/*!40000 ALTER TABLE `administrators` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classrooms`
--

DROP TABLE IF EXISTS `classrooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classrooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_number` varchar(100) DEFAULT NULL,
  `building` varchar(100) DEFAULT NULL,
  `capacity` int DEFAULT '0',
  `status` varchar(50) DEFAULT 'Available',
  `remarks` varchar(255) DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classrooms`
--

LOCK TABLES `classrooms` WRITE;
/*!40000 ALTER TABLE `classrooms` DISABLE KEYS */;
/*!40000 ALTER TABLE `classrooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documenttracking`
--

DROP TABLE IF EXISTS `documenttracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documenttracking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tracking_number` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `document_type` varchar(100) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `sender` varchar(255) DEFAULT NULL,
  `receiver` varchar(255) DEFAULT NULL,
  `date_received` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(100) DEFAULT NULL,
  `remarks` text,
  `attachment` varchar(255) DEFAULT NULL,
  `additional_attachments` text,
  `is_archived` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documenttracking`
--

LOCK TABLES `documenttracking` WRITE;
/*!40000 ALTER TABLE `documenttracking` DISABLE KEYS */;
INSERT INTO `documenttracking` VALUES (1,'TRK-2026-0001','Outgoing','Letter','Letter No. 001 s. 2026, Internet Connectivity','System User','To Be Routed','2026-07-31 13:16:35','Pending','Auto-logged.','/uploads/memoranda/Letter_001_2026_1785474995027.docx',NULL,0,'2026-07-31 05:16:35'),(2,'TRK-2026-0002','Outgoing','Memo','Memo No. 001 s. 2026, Loyalty Day','System User','To Be Routed','2026-07-31 13:17:09','Received','Auto-logged.','/uploads/memoranda/Memo_001_2026_1785475029010.docx',NULL,0,'2026-07-31 05:17:09'),(3,'TRK-2026-0003','Outgoing','Letter','Letter No. 002 s. 2026, Letter of Intent','System User','To Be Routed','2026-08-01 18:39:59','Pending','Auto-logged.','/uploads/memoranda/Letter_002_2026_1785580799843.docx',NULL,0,'2026-08-01 10:39:59'),(4,'TRK-2026-0004','Outgoing','Memo','Memo No. 002 s. 2026, All Faculty & Staff Meeting','System User','To Be Routed','2026-08-01 18:46:46','Pending','Auto-logged.','/uploads/memoranda/Memo_002_2026_1785581206746.docx',NULL,0,'2026-08-01 10:46:46'),(5,'TRK-2026-0005','Outgoing','Endorsement','Endorsement No. 001 s. 2026, Endorsement for Non-Teaching Staff','System User','To Be Routed','2026-08-01 18:50:23','Pending','Auto-logged.','/uploads/memoranda/Endorsement_001_2026_1785581423139.docx',NULL,0,'2026-08-01 10:50:23'),(6,'TRK-2026-0006','Outgoing','Memo','Memo No. 003 s. 2026, Memorandum of Agreement','System User','To Be Routed','2026-08-01 18:51:08','Pending','Auto-logged.','/uploads/memoranda/Memo_003_2026_1785581468605.docx',NULL,0,'2026-08-01 10:51:08'),(7,'TRK-2026-0007','Outgoing','Letter','Letter No. 003 s. 2026, Justification Letter','System User','To Be Routed','2026-08-01 18:57:54','Pending','Auto-logged.','/uploads/memoranda/Letter_003_2026_1785581872698.docx',NULL,0,'2026-08-01 10:57:54'),(8,'TRK-2026-0008','Outgoing','Letter','Letter No. 004 s. 2026, Justification Letter','System User','To Be Routed','2026-08-01 18:57:54','Pending','Auto-logged.','/uploads/memoranda/Letter_004_2026_1785581874360.docx',NULL,0,'2026-08-01 10:57:54'),(9,'TRK-2026-0009','Outgoing','Memo','Memo No. 004 s. 2026, PED 114 Micro Teaching Field Study','System User','To Be Routed','2026-08-01 18:58:27','Pending','Auto-logged.','/uploads/memoranda/Memo_004_2026_1785581906987.docx',NULL,0,'2026-08-01 10:58:27'),(10,'TRK-2026-0010','Outgoing','Letter','Letter for Courtesy Visit to Doc Marly Hasim','Admin Office','2nd District Congressional Office',NULL,'Pending','','/uploads/documents/1785587335401-Letter-for-Courtesy-Visit-to-Doc-Marly-Hasim.docx',NULL,0,'2026-08-01 12:28:55'),(11,'TRK-2027-0001','Outgoing','Memo','Memo No. 001 s. 2027, All Faculty & Staff General Meeting','System User','To Be Routed','2026-08-02 02:19:33','Pending','Auto-logged.','/uploads/memoranda/Memo_001_2027_1785608373109.docx',NULL,0,'2026-08-01 18:19:33'),(12,'TRK-2027-0002','Outgoing','Memo','Memo No. 002 s. 2027, Loyalty Day','System User','To Be Routed','2026-08-02 02:20:38','Pending','Auto-logged.','/uploads/memoranda/Memo_002_2027_1785608438707.docx',NULL,0,'2026-08-01 18:20:38'),(13,'TRK-2027-0003','Outgoing','Memo','Memo No. 003 s. 2027, First Day of Class','System User','To Be Routed','2026-08-02 02:21:33','Pending','Auto-logged.','/uploads/memoranda/Memo_003_2027_1785608493576.docx',NULL,0,'2026-08-01 18:21:33'),(14,'TRK-2027-0004','Outgoing','Memo','Memo No. 004 s. 2027, General Clean Up','System User','To Be Routed','2026-08-02 02:23:01','Pending','Auto-logged.','/uploads/memoranda/Memo_004_2027_1785608581789.docx',NULL,0,'2026-08-01 18:23:01'),(15,'TRK-2027-0005','Outgoing','Letter','Letter No. 001 s. 2027, Proposal','System User','To Be Routed','2026-08-02 02:23:54','Pending','Auto-logged.','/uploads/memoranda/Letter_001_2027_1785608634074.docx',NULL,0,'2026-08-01 18:23:54'),(16,'TRK-2027-0006','Outgoing','Letter','Letter No. 002 s. 2027, Courtesy Visit to Ipil Municipal Mayor','System User','To Be Routed','2026-08-02 02:24:45','Pending','Auto-logged.','/uploads/memoranda/Letter_002_2027_1785608685909.docx',NULL,0,'2026-08-01 18:24:45'),(17,'TRK-2027-0007','Outgoing','Memo','Memo No. 005 s. 2027, General Meeting for All Block Mayors and USC Officers','System User','To Be Routed','2026-08-02 02:28:12','Pending','Auto-logged.','/uploads/memoranda/Memo_005_2027_1785608892588.docx',NULL,0,'2026-08-01 18:28:12');
/*!40000 ALTER TABLE `documenttracking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `memoranda`
--

DROP TABLE IF EXISTS `memoranda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `memoranda` (
  `id` int NOT NULL AUTO_INCREMENT,
  `memo_number` varchar(100) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `content` text,
  `for_name` varchar(255) DEFAULT NULL,
  `for_designation` varchar(255) DEFAULT NULL,
  `thru_name` varchar(255) DEFAULT NULL,
  `thru_designation` varchar(255) DEFAULT NULL,
  `from_name` varchar(255) DEFAULT NULL,
  `from_designation` varchar(255) DEFAULT NULL,
  `table_data` text,
  `issuer_id` int DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `additional_attachments` text,
  `status` varchar(50) DEFAULT 'Draft',
  `is_archived` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `issuer_id` (`issuer_id`),
  CONSTRAINT `memoranda_ibfk_1` FOREIGN KEY (`issuer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `memoranda`
--

LOCK TABLES `memoranda` WRITE;
/*!40000 ALTER TABLE `memoranda` DISABLE KEYS */;
INSERT INTO `memoranda` VALUES (1,'Letter No. 001, s. 2026','Internet Connectivity',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Letter_001_2026_1785474995027.docx',NULL,'Draft',0,'2026-07-31 05:16:35'),(2,'Memo No. 001, s. 2026','Loyalty Day',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Memo_001_2026_1785475029010.docx',NULL,'Draft',0,'2026-07-31 05:17:09'),(3,'Letter No. 002, s. 2026','Letter of Intent',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Letter_002_2026_1785580799843.docx',NULL,'Draft',0,'2026-08-01 10:39:59'),(4,'Memo No. 002, s. 2026','All Faculty & Staff Meeting',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Memo_002_2026_1785581206746.docx',NULL,'Draft',0,'2026-08-01 10:46:46'),(5,'Endorsement No. 001, s. 2026','Endorsement for Non-Teaching Staff',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Endorsement_001_2026_1785581423139.docx',NULL,'Draft',0,'2026-08-01 10:50:23'),(6,'Memo No. 003, s. 2026','Memorandum of Agreement',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Memo_003_2026_1785581468605.docx',NULL,'Draft',0,'2026-08-01 10:51:08'),(7,'Letter No. 003, s. 2026','Justification Letter',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Letter_003_2026_1785581872698.docx',NULL,'Draft',0,'2026-08-01 10:57:52'),(8,'Letter No. 004, s. 2026','Justification Letter',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Letter_004_2026_1785581874360.docx',NULL,'Draft',0,'2026-08-01 10:57:54'),(9,'Memo No. 004, s. 2026','PED 114 Micro Teaching Field Study',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Memo_004_2026_1785581906987.docx',NULL,'Draft',0,'2026-08-01 10:58:26'),(10,'Memo No. 001, s. 2027','All Faculty & Staff General Meeting',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Memo_001_2027_1785608373109.docx',NULL,'Draft',0,'2026-08-01 18:19:33'),(11,'Memo No. 002, s. 2027','Loyalty Day',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Memo_002_2027_1785608438707.docx',NULL,'Draft',0,'2026-08-01 18:20:38'),(12,'Memo No. 003, s. 2027','First Day of Class',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Memo_003_2027_1785608493576.docx',NULL,'Draft',0,'2026-08-01 18:21:33'),(13,'Memo No. 004, s. 2027','General Clean Up',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Memo_004_2027_1785608581789.docx',NULL,'Draft',0,'2026-08-01 18:23:01'),(14,'Letter No. 001, s. 2027','Proposal',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Letter_001_2027_1785608634074.docx',NULL,'Draft',0,'2026-08-01 18:23:54'),(15,'Letter No. 002, s. 2027','Courtesy Visit to Ipil Municipal Mayor',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Letter_002_2027_1785608685909.docx',NULL,'Draft',0,'2026-08-01 18:24:45'),(16,'Memo No. 005, s. 2027','General Meeting for All Block Mayors and USC Officers',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'/uploads/memoranda/Memo_005_2027_1785608892588.docx',NULL,'Draft',0,'2026-08-01 18:28:12');
/*!40000 ALTER TABLE `memoranda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `memosignatories`
--

DROP TABLE IF EXISTS `memosignatories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `memosignatories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `memo_id` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  PRIMARY KEY (`id`),
  KEY `memo_id` (`memo_id`),
  CONSTRAINT `memosignatories_ibfk_1` FOREIGN KEY (`memo_id`) REFERENCES `memoranda` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `memosignatories`
--

LOCK TABLES `memosignatories` WRITE;
/*!40000 ALTER TABLE `memosignatories` DISABLE KEYS */;
/*!40000 ALTER TABLE `memosignatories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `content` text,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Superuser'),(2,'Admin'),(3,'Staff'),(4,'Student');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `systemsettings`
--

DROP TABLE IF EXISTS `systemsettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `systemsettings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` varchar(255) NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `systemsettings`
--

LOCK TABLES `systemsettings` WRITE;
/*!40000 ALTER TABLE `systemsettings` DISABLE KEYS */;
INSERT INTO `systemsettings` VALUES ('academic_year','2026','2026-08-01 14:16:25'),('academic_year_end','2028-05-14','2026-08-01 18:18:54'),('academic_year_start','2027-08-03','2026-08-01 18:18:54'),('contact_email','admin@wmsu.edu.ph','2026-08-01 14:16:25'),('default_pagination','25','2026-08-01 14:16:25'),('enforce_strong_passwords','true','2026-08-01 15:42:38'),('maintenance_mode','false','2026-08-01 15:42:38'),('session_timeout','60','2026-08-01 15:42:38'),('system_name','MyWMSU Ipil Document Portal','2026-08-01 14:16:25');
/*!40000 ALTER TABLE `systemsettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachingloads`
--

DROP TABLE IF EXISTS `teachingloads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachingloads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `instructor_name` varchar(255) DEFAULT NULL,
  `subject_code` varchar(100) DEFAULT NULL,
  `subject_title` varchar(255) DEFAULT NULL,
  `units` int DEFAULT '3',
  `schedule` varchar(255) DEFAULT NULL,
  `room` varchar(100) DEFAULT NULL,
  `semester` varchar(100) DEFAULT '1st Semester',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachingloads`
--

LOCK TABLES `teachingloads` WRITE;
/*!40000 ALTER TABLE `teachingloads` DISABLE KEYS */;
/*!40000 ALTER TABLE `teachingloads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `setup_token` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Active',
  `token_expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'System','Admin','system.admin','admin@wmsu.edu','$2b$10$1OFsptAay6vhVd2AvHjEu.Vbsl2U4LKyDSuvcDfGI/kuGYA.txRIG',NULL,'Archived',NULL),(2,1,'System','Admin',NULL,'admin@wmsu.edu.ph','$2b$10$LvoBujKZjmL.wNyfMQ1XQuMvdyl9Wax9My1vFFbxqbB0PMrdLc9UK',NULL,'Active',NULL),(3,3,'User','1029','user.1029','u0822444@gmail.com','$2b$10$5Mo2z/UPHadT3DutkH3YsesYZI5EWCySyNAiUAhgHr9lDP1449WUW',NULL,'Active',NULL),(5,3,'Ryan Christ','Autida','ryanchrist.autida','testuser98234@gmail.com','$2b$10$vgP83g/hR2OJ.9boWdNeXOySI5AVQs4RIlgXausjOE5SbimoTc1S.',NULL,'Active',NULL),(6,2,'Aleazar','Villanueva','aleazar.villanueva','aleazarjohnvillanueva@gmail.com','$2b$10$ezy9MK3Lb5VX3BSbwN7Olu7Hh6cHsULhbfgKVcmJjxJokkN1E8VFu',NULL,'Active',NULL),(10,2,'Aleazar John','Villanueva','aleazarjohn.villanueva','aleazarvillanueva441@gmail.com','$2b$10$clMj3VGtPQ3rQm5VJlMo/.exAs9pl/PsQzAbbtfYnzciCdMqu2By2',NULL,'Active',NULL),(11,2,'Mark Fuji','Fajiculay','mark.fajiculay','elyxxvi@gmail.com','$2b$10$LXQgXBfa/D9Uotmasea90O4btjTjiNQInaSfXw/nQFJ3JOuZRjLyW',NULL,'Active',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-02 12:28:11
