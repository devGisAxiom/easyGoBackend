-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 10, 2026 at 10:47 AM
-- Server version: 11.8.3-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u160357475_easygo`
--
CREATE DATABASE IF NOT EXISTS `u160357475_easygo` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `u160357475_easygo`;

-- --------------------------------------------------------

--
-- Table structure for table `bikes`
--

CREATE TABLE `bikes` (
  `b_id` int(11) NOT NULL,
  `b_name` varchar(500) NOT NULL,
  `b_ratings` decimal(2,1) DEFAULT NULL,
  `b_description` text NOT NULL,
  `b_price` decimal(10,2) NOT NULL,
  `b_status` varchar(500) NOT NULL DEFAULT 'active',
  `b_location` varchar(500) DEFAULT NULL,
  `b_latitude` varchar(500) NOT NULL,
  `b_longitude` varchar(500) NOT NULL,
  `b_extras` varchar(500) NOT NULL,
  `b_milage` varchar(500) NOT NULL,
  `b_geartype` varchar(500) DEFAULT NULL,
  `b_fueltype` varchar(500) NOT NULL,
  `b_bhp` varchar(500) NOT NULL,
  `b_image` varchar(500) DEFAULT NULL,
  `b_reviews` varchar(500) DEFAULT NULL,
  `distance` int(11) DEFAULT NULL,
  `max_speed` int(11) NOT NULL,
  `maintaince_status` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bikes`
--

INSERT INTO `bikes` (`b_id`, `b_name`, `b_ratings`, `b_description`, `b_price`, `b_status`, `b_location`, `b_latitude`, `b_longitude`, `b_extras`, `b_milage`, `b_geartype`, `b_fueltype`, `b_bhp`, `b_image`, `b_reviews`, `distance`, `max_speed`, `maintaince_status`) VALUES
(4, 'Honda Activa', 4.6, 'The Honda Activa is one of the most popular and trusted scooters in India, known for its reliability, comfort, and practicality. Powered by a refined 110cc or 125cc engine (depending on the variant), it offers smooth performance with excellent fuel efficiency, making it a perfect choice for daily commuting. Its simple yet elegant design, comfortable seating, and strong build quality appeal to riders of all ages. Equipped with features like a digital-analog meter, silent start system, and Combi-Brake System (CBS) for safer braking, the Activa continues to be the go-to scooter for families and individuals alike, combining convenience, durability, and ease of use.', 850.00, 'Active', '7', '132.34.34.54', '32.34.54.54', '2 Helmets ', '9.9', 'Auto', 'petrol', '9.9', NULL, '', 0, 135, 'Well maintaned'),
(15, 'renoult', NULL, 're dust', 99999999.99, 'Active', 'ulloor', '132.34.34.54', '32.34.54.54', '2 helmet', '55', 'manual', 'petrol', '2.3', NULL, NULL, 0, 150, 'not good'),
(16, 'Test Drive Scooty', NULL, 'Desc', 550.00, 'Active', 'Cherpalcheri', '10.88', '76.31', 'Extra', '300KM/Ltr', 'Manual', 'Petrol', '58', NULL, NULL, 0, 1000, 'Well Maintained Test'),
(17, 'R15', NULL, 'ABCDEFGH', 1500.00, 'Maintenance', NULL, '9.2647', '76.783333', 'HELMET', '60', 'MANUAL', 'PETROL', '10.5', NULL, NULL, 0, 155, 'WELL FOCUSED');

-- --------------------------------------------------------

--
-- Table structure for table `bike_centers`
--

CREATE TABLE `bike_centers` (
  `bc_id` int(11) NOT NULL,
  `bc_bike_id` int(11) NOT NULL,
  `bc_center_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bike_centers`
--

INSERT INTO `bike_centers` (`bc_id`, `bc_bike_id`, `bc_center_id`) VALUES
(1, 1, 2),
(2, 1, 4),
(3, 2, 2),
(4, 2, 3),
(5, 3, 2),
(6, 3, 3),
(11, 8, 6),
(12, 8, 7),
(13, 8, 8),
(14, 8, 9),
(15, 9, 10),
(16, 9, 6),
(17, 9, 2),
(18, 10, 10),
(19, 10, 9),
(20, 10, 2),
(21, 11, 2),
(22, 11, 3),
(23, 11, 9),
(24, 12, 9),
(25, 12, 10),
(26, 12, 8),
(27, 12, 7),
(28, 13, 11),
(29, 13, 10),
(30, 14, 2),
(31, 14, 3),
(32, 14, 9),
(33, 14, 10),
(74, 16, 12),
(103, 5, 2),
(104, 5, 3),
(105, 5, 8),
(106, 5, 9),
(107, 15, 7),
(108, 15, 6),
(109, 15, 8),
(144, 4, 2),
(145, 4, 3),
(146, 4, 4),
(171, 17, 8),
(172, 17, 9),
(173, 17, 2),
(174, 17, 6);

-- --------------------------------------------------------

--
-- Table structure for table `bike_images`
--

CREATE TABLE `bike_images` (
  ` img_id` int(11) NOT NULL,
  `bike_id` int(11) NOT NULL,
  `image_path` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bike_images`
--

INSERT INTO `bike_images` (` img_id`, `bike_id`, `image_path`) VALUES
(1, 1, '/uploads/bikes/download (1).jpg'),
(2, 1, '/uploads/bikes/download (2).jpg'),
(3, 1, '/uploads/bikes/download.jpg'),
(4, 1, '/uploads/bikes/mt.jpg'),
(5, 2, '/uploads/bikes/download (1).jpg'),
(6, 2, '/uploads/bikes/download (2).jpg'),
(7, 2, '/uploads/bikes/download.jpg'),
(8, 2, '/uploads/bikes/mt.jpg'),
(9, 3, '/uploads/bikes/download (1).jpg'),
(10, 3, '/uploads/bikes/download (2).jpg'),
(11, 3, '/uploads/bikes/download.jpg'),
(12, 3, '/uploads/bikes/mt.jpg'),
(13, 4, '/uploads/bikes/activa.jpg'),
(14, 4, '/uploads/bikes/download (1).jpg'),
(15, 4, '/uploads/bikes/download (3).jpg'),
(16, 4, '/uploads/bikes/download.jpg'),
(17, 5, '/uploads/bikes/download (1).jpg'),
(18, 5, '/uploads/bikes/download.jpg'),
(19, 5, '/uploads/bikes/fascino1.jpg'),
(20, 5, '/uploads/bikes/images.jpg'),
(21, 8, '/uploads/bikes/10-21 12:10:28_WhatsApp Image 2023-11-21 at 23.15.31_51a554ab.jpg'),
(22, 9, '/uploads/bikes/10-25 05:10:50_jupiterjupiterrearview (1).webp'),
(23, 9, '/uploads/bikes/10-25 05:10:50_jupiterjupiterrightfrontthreequarter.webp'),
(24, 10, '/uploads/bikes/10-25 05:10:60_jupiterjupiterrearview (1).webp'),
(25, 10, '/uploads/bikes/10-25 05:10:60_jupiterjupiterrightfrontthreequarter.webp'),
(26, 11, '/uploads/bikes/10-25 05:10:32_jupiterjupiterrearview (1).webp'),
(27, 11, '/uploads/bikes/10-25 05:10:32_jupiterjupiterrightfrontthreequarter.webp'),
(28, 12, '/uploads/bikes/10-25 07:10:82_WhatsApp Image 2023-11-21 at 23.15.31_51a554ab.jpg'),
(29, 12, '/uploads/bikes/10-25 07:10:82_WhatsApp Image 2023-11-21 at 23.28.12_75262ce7.jpg'),
(30, 13, '/uploads/bikes/10-25 07:10:13_Screenshot 2025-09-24 100106.png'),
(31, 13, '/uploads/bikes/10-25 07:10:13_Screenshot 2025-09-24 101523.png'),
(32, 13, '/uploads/bikes/10-25 07:10:13_Screenshot 2025-09-24 113126.png'),
(33, 14, '/uploads/bikes/10-25 07:10:38_jupiterjupiterrearview (1).webp'),
(34, 14, '/uploads/bikes/10-25 07:10:38_jupiterjupiterrightfrontthreequarter.webp'),
(35, 15, '/uploads/bikes/10-27 06:10:42_download.jpg'),
(36, 15, '/uploads/bikes/10-27 06:10:42_mt.jpg'),
(37, 16, '/uploads/bikes/10-30 09:10:60_jupiterjupiterrearview (1).webp'),
(38, 16, '/uploads/bikes/10-30 09:10:60_jupiterjupiterrightfrontthreequarter.webp'),
(39, 17, '/uploads/bikes/11-08 13:11:73_activa.jpg'),
(40, 17, '/uploads/bikes/11-08 13:11:73_download (1).jpg'),
(41, 17, '/uploads/bikes/11-08 13:11:73_download (3).jpg'),
(42, 17, '/uploads/bikes/11-08 13:11:73_download.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `bike_reviews`
--

CREATE TABLE `bike_reviews` (
  `br_id` int(11) NOT NULL,
  `br_used_id` int(11) NOT NULL,
  `br_bike_id` int(11) NOT NULL,
  `br_review` varchar(500) NOT NULL,
  `br_rating` decimal(2,1) NOT NULL,
  `date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bike_reviews`
--

INSERT INTO `bike_reviews` (`br_id`, `br_used_id`, `br_bike_id`, `br_review`, `br_rating`, `date`) VALUES
(1, 2, 4, 'ufkdeluxktaitzmgzmydmhhdkdlhdlyxmbzitsmgzurajfKgsoydlhclhdlhhhxhdxjcuf ufkdeluxktaitzmgzmydmhhdkdlhdlyxmbzitsmgzurajfKgsoydlhclhdlhhhxhdxjcufufkdeluxktaitzmgzmydmhhdkdlhdlyxmbzitsmgzurajfKgsoydlhclhdlhhhxhdxjcuf ufkdeluxktaitzmgzmydmhhdkdlhdlyxmbzitsmgzurajfKgsoydlhclhdlhhhxhdxjcufufkdeluxktaitzmgzmydmhhdkdlhdlyxmbzitsmgzurajfKgsoydlhclhdlhhhxhdxjcuf ufkdeluxktaitzmgzmydmhhdkdlhdlyxmbzitsmgzurajfKgsoydlhclhdlhhhxhdxjcufufkdeluxktaitzmgzmydmhhdkdlhdlyxmbzitsmgzurajfKgsoydlhclhdlhhhxhdxjcuf ufkdel', 5.0, '2025-10-30'),
(2, 3, 4, 'Wonderful ride', 5.0, '2025-10-30');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `b_id` int(11) NOT NULL,
  `b_u_id` int(11) NOT NULL,
  `b_bk_id` int(11) DEFAULT NULL,
  `b_price_id` int(11) NOT NULL,
  `b_rent_amount` decimal(10,2) NOT NULL,
  `b_fine_amount` decimal(10,2) DEFAULT NULL,
  `b_total_amount` decimal(10,2) NOT NULL,
  `b_pickup_location` varchar(500) NOT NULL,
  `b_pickup_date` date NOT NULL,
  `b_picup_time` varchar(500) NOT NULL,
  `b_drop_location` varchar(500) NOT NULL,
  `b_drop_date` date NOT NULL,
  `b_drop_time` varchar(500) NOT NULL,
  `b_role` varchar(500) DEFAULT NULL,
  `b_type` varchar(500) DEFAULT NULL,
  `b_message` text DEFAULT NULL,
  `booking_date` date NOT NULL,
  `invoice` varchar(500) DEFAULT NULL,
  `b_selfie` varchar(500) NOT NULL,
  `b_adharfront` varchar(500) DEFAULT NULL,
  `b_adharback` varchar(500) DEFAULT NULL,
  `b_licensefront` varchar(500) DEFAULT NULL,
  `b_licenseback` varchar(500) DEFAULT NULL,
  `view_reason` varchar(500) DEFAULT NULL,
  `b_bike_name` varchar(500) DEFAULT NULL,
  `extend_reason` varchar(500) DEFAULT NULL,
  `b_payment_status` varchar(500) NOT NULL DEFAULT 'Pending',
  `b_status` varchar(500) NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`b_id`, `b_u_id`, `b_bk_id`, `b_price_id`, `b_rent_amount`, `b_fine_amount`, `b_total_amount`, `b_pickup_location`, `b_pickup_date`, `b_picup_time`, `b_drop_location`, `b_drop_date`, `b_drop_time`, `b_role`, `b_type`, `b_message`, `booking_date`, `invoice`, `b_selfie`, `b_adharfront`, `b_adharback`, `b_licensefront`, `b_licenseback`, `view_reason`, `b_bike_name`, `extend_reason`, `b_payment_status`, `b_status`) VALUES
(1, 6, NULL, 3, 587.75, 0.00, 587.75, 'Perumkulam, Varkala tvm', '2026-01-19', '2026-01-19 12:00:00.000', 'Perumkulam, Varkala tvm', '2026-01-19', '2026-01-19 16:00:00.000', NULL, NULL, NULL, '2026-01-19', NULL, '/uploads/booking/cc1670bd-8c6e-4dc9-b55a-60229b8f3bc13190031569870446700.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'completed'),
(2, 4, NULL, 2, 535.25, 0.00, 535.25, 'City Bike Hub Updated kurukkanmoola', '2026-01-19', '2026-01-19 16:00:00.000', 'City Bike Hub Updated kurukkanmoola', '2026-01-19', '2026-01-19 18:00:00.000', NULL, NULL, NULL, '2026-01-19', NULL, '/uploads/booking/1000291011.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'completed'),
(3, 2, NULL, 1, 455.11, 0.00, 455.11, 'Perumkulam, Varkala tvm', '2026-01-20', '2026-01-20 12:00:00.000', 'Perumkulam, Varkala tvm', '2026-01-20', '2026-01-20 13:00:00.000', NULL, NULL, NULL, '2026-01-20', NULL, '/uploads/booking/1000050371.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'rejected'),
(4, 2, NULL, 1, 455.11, 0.00, 455.11, 'Perumkulam, Varkala tvm', '2026-01-20', '2026-01-20 13:00:00.000', 'Perumkulam, Varkala tvm', '2026-01-20', '2026-01-20 14:00:00.000', NULL, NULL, NULL, '2026-01-20', NULL, '/uploads/booking/1000050548.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'approved'),
(5, 2, NULL, 1, 455.11, 0.00, 455.11, 'Perumkulam, Varkala tvm', '2026-01-20', '2026-01-20 13:00:00.000', 'Perumkulam, Varkala tvm', '2026-01-20', '2026-01-20 14:00:00.000', NULL, NULL, NULL, '2026-01-20', NULL, '/uploads/booking/1000050548.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'approved'),
(6, 2, NULL, 1, 455.11, 0.00, 455.11, 'Perumkulam, Varkala tvm', '2026-01-20', '2026-01-20 13:00:00.000', 'Perumkulam, Varkala tvm', '2026-01-20', '2026-01-20 14:00:00.000', NULL, NULL, NULL, '2026-01-20', NULL, '/uploads/booking/1000050548.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'approved'),
(7, 2, NULL, 1, 455.11, 0.00, 455.11, 'Perumkulam, Varkala tvm', '2026-01-20', '2026-01-20 13:00:00.000', 'Perumkulam, Varkala tvm', '2026-01-20', '2026-01-20 14:00:00.000', NULL, NULL, NULL, '2026-01-20', NULL, '/uploads/booking/1000050548.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'approved'),
(8, 2, NULL, 1, 455.11, 0.00, 455.11, 'Perumkulam, Varkala tvm', '2026-01-20', '2026-01-20 13:00:00.000', 'Perumkulam, Varkala tvm', '2026-01-20', '2026-01-20 14:00:00.000', NULL, NULL, NULL, '2026-01-20', NULL, '/uploads/booking/1000050548.jpg', NULL, NULL, NULL, NULL, 'bb', NULL, NULL, 'paid', 'cancelled'),
(9, 2, NULL, 1, 455.11, 150.00, 605.11, 'City Bike Hub Updated kurukkanmoola', '2026-01-20', '2026-01-20 13:00:00.000', 'meenanooir,tfjyyfyutf trissur', '2026-01-20', '2026-01-20 14:00:00.000', NULL, NULL, NULL, '2026-01-20', NULL, '/uploads/booking/1000050548.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'approved'),
(10, 2, NULL, 4, 692.75, 150.00, 842.75, 'Perumkulam, Varkala tvm', '2026-01-21', '2026-01-21 10:00:00.000', 'pathanamthitta pathanamthitta', '2026-01-21', '2026-01-21 18:00:00.000', NULL, NULL, NULL, '2026-01-21', NULL, '/uploads/booking/1000051437.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(11, 9, NULL, 2, 535.25, 150.00, 685.25, 'City Bike Hub Updated kurukkanmoola', '2026-01-21', '2026-01-21 11:00:00.000', 'pathanamthitta pathanamthitta', '2026-01-21', '2026-01-21 13:00:00.000', NULL, NULL, NULL, '2026-01-21', NULL, '/uploads/booking/1000450536.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'approved'),
(12, 2, NULL, 2, 535.25, 0.00, 535.25, 'ranni pathanamthtta', '2026-01-22', '2026-01-22 10:00:00.000', 'ranni pathanamthtta', '2026-01-22', '2026-01-22 12:00:00.000', NULL, NULL, NULL, '2026-01-22', NULL, '/uploads/booking/69f139cb-6dab-4474-90cc-c6b8635b97f26026310218700739497.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'rejected'),
(13, 6, NULL, 4, 692.75, 150.00, 842.75, 'ERANAKULAM NORTH ERNAKULAM', '2026-01-28', '2026-01-28 16:00:00.000', 'VYTTILA ERANAKULAM', '2026-01-29', '2026-01-29 00:00:00.000', NULL, NULL, NULL, '2026-01-28', NULL, '/uploads/booking/50ff0b47-e9ad-4d73-ba70-b0c6d26cecb07840194983387138485.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'approved'),
(14, 6, NULL, 2, 535.25, 0.00, 535.25, 'ERANAKULAM NORTH ERNAKULAM', '2026-02-05', '2026-02-05 19:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-02-05', '2026-02-05 21:00:00.000', NULL, NULL, NULL, '2026-02-05', NULL, '/uploads/booking/53d1f958-ed4d-47d1-b740-30ff98f846804351239413653272467.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(15, 6, NULL, 7, 971.50, 149.00, 1120.50, 'ERANAKULAM NORTH ERNAKULAM', '2026-02-05', '2026-02-05 19:00:00.000', 'VYTTILA ERANAKULAM', '2026-02-06', '2026-02-06 07:00:00.000', NULL, NULL, NULL, '2026-02-05', NULL, '/uploads/booking/e54528de-ed28-47cd-8074-cbe7703c50dd46892664036985071.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'approved'),
(16, 6, NULL, 3, 587.75, 0.00, 587.75, 'ERANAKULAM NORTH ERNAKULAM', '2026-02-07', '2026-02-07 20:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-02-08', '2026-02-08 00:00:00.000', NULL, NULL, NULL, '2026-02-07', NULL, '/uploads/booking/c515c773-f266-4d18-85e3-b7f56187732f1278811055804550275.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(17, 6, NULL, 2, 535.25, 0.00, 535.25, 'VYTTILA ERANAKULAM', '2026-02-09', '2026-02-09 09:00:00.000', 'VYTTILA ERANAKULAM', '2026-02-09', '2026-02-09 11:00:00.000', NULL, NULL, NULL, '2026-02-09', NULL, '/uploads/booking/9e438b1a-6d03-4416-bcd0-6ef426b871062074704836468640860.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(18, 2, NULL, 1, 455.11, 0.00, 455.11, 'ERNAKULAM SOUTH ERANAKULAM', '2026-02-11', '2026-02-11 10:00:00.000', 'ERNAKULAM SOUTH ERANAKULAM', '2026-02-11', '2026-02-11 11:00:00.000', NULL, NULL, NULL, '2026-02-11', NULL, '/uploads/booking/1000056777.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(19, 2, NULL, 1, 455.11, 0.00, 455.11, 'ERANAKULAM NORTH ERNAKULAM', '2026-02-11', '2026-02-11 12:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-02-11', '2026-02-11 13:00:00.000', NULL, NULL, NULL, '2026-02-11', NULL, '/uploads/booking/1000056777.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(20, 6, NULL, 2, 535.25, 0.00, 535.25, 'ERANAKULAM NORTH ERNAKULAM', '2026-02-13', '2026-02-13 13:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-02-13', '2026-02-13 15:00:00.000', NULL, NULL, NULL, '2026-02-13', NULL, '/uploads/booking/e92146c3-f929-44ed-801c-38aeab69746a7307157252046310522.jpg', NULL, NULL, NULL, NULL, 'bn', NULL, NULL, 'paid', 'cancelreq'),
(21, 6, NULL, 3, 587.75, 149.00, 736.75, 'VYTTILA ERANAKULAM', '2026-02-14', '2026-02-14 12:00:00.000', 'THOPPUMPADI ERANAKULAM', '2026-02-14', '2026-02-14 16:00:00.000', NULL, NULL, NULL, '2026-02-14', NULL, '/uploads/booking/5234640d-4c6b-4f87-9088-f42dd26bc61d664220325441724256.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(22, 2, NULL, 1, 455.11, 0.00, 455.11, 'ERNAKULAM SOUTH ERANAKULAM', '2026-02-14', '2026-02-14 13:00:00.000', 'ERNAKULAM SOUTH ERANAKULAM', '2026-02-14', '2026-02-14 14:00:00.000', NULL, NULL, NULL, '2026-02-14', NULL, '/uploads/booking/e684325a-cd47-4dd5-b4e0-32be3f2fe5566272828623332049559.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(23, 6, NULL, 1, 455.11, 0.00, 455.11, 'ERANAKULAM NORTH ERNAKULAM', '2026-02-17', '2026-02-17 12:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-02-17', '2026-02-17 13:00:00.000', NULL, NULL, NULL, '2026-02-17', NULL, '/uploads/booking/35b3fd37-6a00-4d47-a513-8dcc0cdb76508414802301196953742.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(24, 6, NULL, 2, 535.25, 0.00, 535.25, 'ERANAKULAM NORTH ERNAKULAM', '2026-02-17', '2026-02-17 12:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-02-17', '2026-02-17 14:00:00.000', NULL, NULL, NULL, '2026-02-17', NULL, '/uploads/booking/c4d66004-70c2-4736-8755-bd78f6cad3313542988716054103018.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'cancelled'),
(25, 15, NULL, 1, 455.11, 0.00, 455.11, 'ERANAKULAM NORTH ERNAKULAM', '2026-02-17', '2026-02-17 13:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-02-17', '2026-02-17 14:00:00.000', NULL, NULL, NULL, '2026-02-17', NULL, '/uploads/booking/a753ad0d-f5cd-497e-95a8-d7d6cc527fb51033595478744648860.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(26, 9, NULL, 1, 455.11, 149.00, 604.11, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-01', '2026-03-01 15:55:00.000', 'VYTTILA ERANAKULAM', '2026-03-01', '2026-03-01 16:55:00.000', NULL, NULL, NULL, '2026-02-20', NULL, '/uploads/booking/46f2ed5e-4344-4973-9a3b-c33e76c163a82214481408489096834.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(27, 9, NULL, 1, 455.11, 0.00, 455.11, 'ERANAKULAM NORTH ERNAKULAM', '2026-02-20', '2026-02-20 14:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-02-20', '2026-02-20 15:00:00.000', NULL, NULL, NULL, '2026-02-20', NULL, '/uploads/booking/d57dbbb5-1417-4331-97d8-18bfd827a3264683532251854627400.jpg', NULL, NULL, NULL, NULL, 'nh', NULL, NULL, 'paid', 'cancelreq'),
(28, 9, NULL, 1, 455.11, 149.00, 604.11, 'VYTTILA ERANAKULAM', '2026-02-20', '2026-02-20 15:00:00.000', 'THOPPUMPADI ERANAKULAM', '2026-02-20', '2026-02-20 16:00:00.000', NULL, NULL, NULL, '2026-02-20', NULL, '/uploads/booking/1000469040.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(29, 9, NULL, 1, 455.11, 149.00, 604.11, 'VYTTILA ERANAKULAM', '2026-02-20', '2026-02-20 15:00:00.000', 'THOPPUMPADI ERANAKULAM', '2026-02-20', '2026-02-20 16:00:00.000', NULL, NULL, NULL, '2026-02-20', NULL, '/uploads/booking/1000469040.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(30, 3, NULL, 1, 455.11, 0.00, 455.11, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-04', '2026-03-04 14:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-04', '2026-03-04 15:00:00.000', NULL, NULL, NULL, '2026-03-03', NULL, '/uploads/booking/1000318525.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(31, 15, NULL, 2, 535.25, 0.00, 535.25, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-03', '2026-03-03 14:30:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-03', '2026-03-03 16:30:00.000', NULL, NULL, NULL, '2026-03-03', NULL, '/uploads/booking/019d3d2a-cea6-428f-8d7c-cd0214f198ae3934437720759793980.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(32, 15, NULL, 2, 535.25, 0.00, 535.25, 'VYTTILA ERANAKULAM', '2026-03-03', '2026-03-03 14:00:00.000', 'VYTTILA ERANAKULAM', '2026-03-03', '2026-03-03 16:00:00.000', NULL, NULL, NULL, '2026-03-03', NULL, '/uploads/booking/00f7147f-630c-45d5-9a48-a7011f878a2c8452797536552251158.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(33, 15, NULL, 1, 455.11, 0.00, 455.11, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-04', '2026-03-04 09:30:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-04', '2026-03-04 10:30:00.000', NULL, NULL, NULL, '2026-03-04', NULL, '/uploads/booking/eff21a5b-b93f-4281-b0ac-9d2ca437fca82873056906167571152.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(34, 16, NULL, 2, 535.25, 0.00, 535.25, 'VYTTILA ERANAKULAM', '2026-03-05', '2026-03-05 10:11:00.000', 'VYTTILA ERANAKULAM', '2026-03-05', '2026-03-05 12:11:00.000', NULL, NULL, NULL, '2026-03-04', NULL, '/uploads/booking/1000255219.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(35, 18, NULL, 1, 455.11, 149.00, 604.11, 'VYTTILA ERANAKULAM', '2026-03-04', '2026-03-04 12:00:00.000', 'THOPPUMPADI ERANAKULAM', '2026-03-04', '2026-03-04 13:00:00.000', NULL, NULL, NULL, '2026-03-04', NULL, '/uploads/booking/1000121407.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(36, 6, NULL, 8, 1039.75, 149.00, 1188.75, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-05', '2026-03-05 17:20:00.000', 'THOPPUMPADI ERANAKULAM', '2026-03-06', '2026-03-06 17:20:00.000', NULL, NULL, NULL, '2026-03-05', NULL, '/uploads/booking/d9b767ff-5519-454b-93f7-6d30775213824612036271565203933.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(37, 21, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:15:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:15:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/6dccf331-2d18-480b-8eea-5bccf86406e14162349145761677029.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'completed'),
(38, 21, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:15:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:15:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/6dccf331-2d18-480b-8eea-5bccf86406e14162349145761677029.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(39, 21, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:15:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:15:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/6dccf331-2d18-480b-8eea-5bccf86406e14162349145761677029.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(40, 21, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:15:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:15:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/6dccf331-2d18-480b-8eea-5bccf86406e14162349145761677029.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(41, 21, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:15:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:15:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/6dccf331-2d18-480b-8eea-5bccf86406e14162349145761677029.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(42, 21, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:15:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:15:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/6dccf331-2d18-480b-8eea-5bccf86406e14162349145761677029.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(43, 21, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:15:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:15:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/6dccf331-2d18-480b-8eea-5bccf86406e14162349145761677029.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(44, 21, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:15:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:15:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/6dccf331-2d18-480b-8eea-5bccf86406e14162349145761677029.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(45, 21, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:15:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:15:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/c7ef43d2-7fe9-4886-8425-9d95ea7d65f55025276341008754325.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(46, 21, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:15:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:15:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/c7ef43d2-7fe9-4886-8425-9d95ea7d65f55025276341008754325.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(47, 21, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:15:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:15:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/c7ef43d2-7fe9-4886-8425-9d95ea7d65f55025276341008754325.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(48, 21, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:15:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:15:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/c7ef43d2-7fe9-4886-8425-9d95ea7d65f55025276341008754325.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(49, 22, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:15:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:15:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/53d67a36-0f69-4ba7-a356-acb0f6bc64ba885077476786191374.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(50, 23, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/111c952a-284d-4e9b-a838-1829d5c325f59207368500091881624.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(51, 15, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:30:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:30:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/9cd97d8e-da16-4946-9a7c-e77ba5e607c3960815449926963080.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(52, 15, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:30:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:30:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/9cd97d8e-da16-4946-9a7c-e77ba5e607c3960815449926963080.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(53, 15, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:30:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:30:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/9cd97d8e-da16-4946-9a7c-e77ba5e607c3960815449926963080.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'approved'),
(54, 15, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:30:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:30:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/9cd97d8e-da16-4946-9a7c-e77ba5e607c3960815449926963080.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(55, 24, NULL, 1, 455.11, 0.00, 455.11, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 19:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/8327cf11-1d87-4851-beef-1dfad14bb81f5863834592487210237.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(56, 24, NULL, 1, 455.11, 0.00, 455.11, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 19:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/8327cf11-1d87-4851-beef-1dfad14bb81f5863834592487210237.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(57, 24, NULL, 13, 1281.12, 0.00, 1281.12, 'VYTTILA ERANAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'VYTTILA ERANAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/887666a7-7866-4411-861a-82d6c7de9cbc8848014302304191762.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(58, 24, NULL, 13, 1281.12, 0.00, 1281.12, 'VYTTILA ERANAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'VYTTILA ERANAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/887666a7-7866-4411-861a-82d6c7de9cbc8848014302304191762.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(59, 24, NULL, 13, 1281.12, 0.00, 1281.12, 'VYTTILA ERANAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'VYTTILA ERANAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/887666a7-7866-4411-861a-82d6c7de9cbc8848014302304191762.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(60, 24, NULL, 13, 1281.12, 0.00, 1281.12, 'VYTTILA ERANAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'VYTTILA ERANAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/887666a7-7866-4411-861a-82d6c7de9cbc8848014302304191762.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(61, 24, NULL, 13, 1281.12, 0.00, 1281.12, 'VYTTILA ERANAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'VYTTILA ERANAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/887666a7-7866-4411-861a-82d6c7de9cbc8848014302304191762.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(62, 3, NULL, 1, 455.11, 0.00, 455.11, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 19:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 20:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320496.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(63, 15, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/24369c0c-1ea4-4e21-bc50-0a97d58b3ad13324057881009180284.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(64, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320674.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(65, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320674.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(66, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320674.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(67, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320674.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(68, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320674.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(69, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320674.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(70, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320674.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(71, 23, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:39:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:39:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/2d379b6e-55b0-479d-a4fb-0c0987ad1f365997371278339301460.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(72, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320674.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(73, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320674.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(74, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320674.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(75, 23, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:39:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:39:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/2d379b6e-55b0-479d-a4fb-0c0987ad1f365997371278339301460.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(76, 15, NULL, 3, 587.75, 0.00, 587.75, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 22:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/c8d98a56-4c32-4429-b174-645d21e35f256756577874332169642.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(77, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320674.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(78, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320674.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(79, 3, NULL, 12, 7364.00, 0.00, 7364.00, 'VYTTILA ERANAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'VYTTILA ERANAKULAM', '2026-04-03', '2026-04-03 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320728.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(80, 3, NULL, 9, 1822.50, 0.00, 1822.50, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-09', '2026-03-09 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320728.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(81, 3, NULL, 8, 1039.75, 0.00, 1039.75, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-07', '2026-03-07 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320728.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(82, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320728.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(83, 6, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:50:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:50:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/b1e97476-0eb8-4127-82d8-84899110773c5480386656493276936.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(84, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320728.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(85, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320728.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(86, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320728.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(87, 3, NULL, 9, 1822.50, 0.00, 1822.50, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-09', '2026-03-09 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320674.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(88, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/98c1055a-b018-4c20-a9b6-ce3585088bac3724539580582475052.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(89, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/98c1055a-b018-4c20-a9b6-ce3585088bac3724539580582475052.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(90, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/98c1055a-b018-4c20-a9b6-ce3585088bac3724539580582475052.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(91, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/98c1055a-b018-4c20-a9b6-ce3585088bac3724539580582475052.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(92, 3, NULL, 9, 1822.50, 0.00, 1822.50, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-09', '2026-03-09 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/57d8791c-2e79-4fea-8359-6be0323e22934689789272447961794.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(93, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/2025de58-0667-4738-a283-c7dd3e9715711790352600917988220.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(94, 3, NULL, 12, 7364.00, 0.00, 7364.00, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-04-03', '2026-04-03 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/3d53b90b-bc0f-4886-bd2b-d28d480f324f1593303907858172342.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(95, 6, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 19:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 19:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/e6a264bb-2396-47f2-b252-9b1f003064897022925373781009849.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(96, 3, NULL, 8, 1039.75, 0.00, 1039.75, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-07', '2026-03-07 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/20aa8989-7e86-477e-8dde-5e3cdc3934d25837348716109995980.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(97, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/10c9099f-aa8a-4f94-a6ad-0c33089519203262045328355597606.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(98, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/10c9099f-aa8a-4f94-a6ad-0c33089519203262045328355597606.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(99, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/10c9099f-aa8a-4f94-a6ad-0c33089519203262045328355597606.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'rejected'),
(100, 3, NULL, 12, 7364.00, 0.00, 7364.00, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-04-03', '2026-04-03 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/dad97d67-afc4-4fe0-80cb-3ddd6c40b9dd512791073250513383.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(101, 3, NULL, 12, 7364.00, 0.00, 7364.00, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-04-03', '2026-04-03 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/dad97d67-afc4-4fe0-80cb-3ddd6c40b9dd512791073250513383.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(102, 3, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 18:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 18:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/1000320728.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(103, 6, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 19:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 19:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/5cba48a0-1183-4883-8df2-051b2d3a5424121723227518187150.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(104, 3, NULL, 1, 455.11, 0.00, 455.11, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 19:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 20:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/2df1cf21-136c-49f6-bc04-d35a732a65f93384386888766359788.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'pending'),
(105, 23, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 19:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 19:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/52695405-dbbe-4c1d-870b-6b033a24de743739205060526980037.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(106, 22, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 19:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 19:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/b1aa712f-306c-4344-8d14-f67513a2aa765484864521150046417.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'cancelled'),
(107, 21, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 19:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 19:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/e52fb8b1-e45e-43a2-91cc-dc7eae2326c82345084586367145155.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(108, 22, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 19:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 19:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/4845a8b3-3b8f-4700-99de-e18d60b747215187564258416414242.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(109, 20, NULL, 13, 1281.12, 0.00, 1281.12, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 19:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 19:00:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/17decf43-cf7f-4bb2-8e44-83def76429d41416946808420749611.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(110, 25, NULL, 10, 3660.50, 0.00, 3660.50, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 20:30:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-13', '2026-03-13 20:30:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/c495d4bb-4f7d-41b3-a031-736a848748965098130496197671261.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'onride'),
(111, 26, NULL, 10, 3660.50, 0.00, 3660.50, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 20:30:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-13', '2026-03-13 20:30:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/e06b2f50-765a-4a46-be31-c300c5a117185541040334908490579.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'approved'),
(112, 26, NULL, 10, 3660.50, 0.00, 3660.50, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-06', '2026-03-06 20:30:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-13', '2026-03-13 20:30:00.000', NULL, NULL, NULL, '2026-03-06', NULL, '/uploads/booking/6aa2f209-2427-4d6a-b2d3-a0e4b621a02f2701860918368531285.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'onride'),
(113, 28, NULL, 3, 587.75, 0.00, 587.75, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-07', '2026-03-07 16:45:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-07', '2026-03-07 20:45:00.000', NULL, NULL, NULL, '2026-03-07', NULL, '/uploads/booking/30d332dd-6b35-4387-ab8d-031807cc85f56250503301395277101.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'completed'),
(114, 27, NULL, 9, 1822.50, 0.00, 1822.50, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-07', '2026-03-07 20:50:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-10', '2026-03-10 20:50:00.000', NULL, NULL, NULL, '2026-03-07', NULL, '/uploads/booking/1001531795.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'onride'),
(115, 33, NULL, 1, 455.11, 0.00, 455.11, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 00:50:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 01:50:00.000', NULL, NULL, NULL, '2026-03-07', NULL, '/uploads/booking/982fa79c-ccfe-4e54-bfb6-c3cc67cd8c898852875424224046129.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'completed'),
(116, 33, NULL, 1, 455.11, 0.00, 455.11, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 00:50:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 01:50:00.000', NULL, NULL, NULL, '2026-03-07', NULL, '/uploads/booking/1a7add05-efab-4498-9639-942add8cb1752184814035700479114.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'completed'),
(117, 33, NULL, 1, 455.11, 0.00, 455.11, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 01:00:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-08', '2026-03-08 02:00:00.000', NULL, NULL, NULL, '2026-03-07', NULL, '/uploads/booking/d6b09f01-3ce6-4120-be97-1d854d847ed04970729928817345510.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pending', 'approved'),
(118, 35, NULL, 2, 535.25, 0.00, 535.25, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-09', '2026-03-09 14:45:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-09', '2026-03-09 16:45:00.000', NULL, NULL, NULL, '2026-03-09', NULL, '/uploads/booking/68a88587-2c93-4251-82dd-a3a16d53039a5763308021089028353.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'approved'),
(119, 42, NULL, 4, 692.75, 0.00, 692.75, 'ERANAKULAM NORTH ERNAKULAM', '2026-03-10', '2026-03-10 09:45:00.000', 'ERANAKULAM NORTH ERNAKULAM', '2026-03-10', '2026-03-10 17:45:00.000', NULL, NULL, NULL, '2026-03-10', NULL, '/uploads/booking/5e5833fd-e576-493c-9f59-fd988478a9d95396476750422278092.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'paid', 'onride');

-- --------------------------------------------------------

--
-- Table structure for table `ContactUs`
--

CREATE TABLE `ContactUs` (
  `c_id` int(11) NOT NULL,
  `c_name` varchar(500) NOT NULL,
  `c_email` varchar(500) NOT NULL,
  `c_phonenumber` bigint(20) NOT NULL,
  `c_issuetype` varchar(500) NOT NULL,
  `c_message` text NOT NULL,
  `c_image` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ContactUs`
--

INSERT INTO `ContactUs` (`c_id`, `c_name`, `c_email`, `c_phonenumber`, `c_issuetype`, `c_message`, `c_image`) VALUES
(1, 'alfin ms', 'msalfin18@gmail.com', 9747662524, 'Bike Condition', 'bxbxbd', '/uploads/contact/1000402361.png'),
(2, 'alfin ms', 'msalfin18@gmail.com', 9747662524, 'Bike Condition', 'bxbxbd', '/uploads/contact/1000402361.png'),
(3, 'alfin ms', 'msalfin18@gmail.com', 9747662524, 'Bike Condition', 'bxbxbd', '/uploads/contact/1000402361.png'),
(4, 'alfin ms', 'msalfin18@gmail.com', 9747662524, 'Bike Condition', 'bxbxbd', '/uploads/contact/1000402361.png'),
(5, 'alfin ms', 'msalfin18@gmail.com', 9747662524, 'Bike Condition', 'bxbxbd', '/uploads/contact/1000402361.png'),
(6, 'Hijas Palakkal', 'mohdhijas.p47@gmail.com', 9995013130, 'Booking Issue', 'Test issues', '/uploads/contact/1000062742.jpg'),
(7, 'alfin ms', 'msalfin18@gmail.com', 9747662524, 'Booking Issue', 'jJa', '/uploads/contact/1000403188.jpg'),
(8, 'Hijas Palakkal', 'mohdhijas.p47@gmail.com', 9995013130, 'Bike Condition', 'description testing bike condition.', '/uploads/contact/20e766d3-e4d8-4048-949d-40c6d09f9a871955502150365867255.jpg'),
(9, 'test', 'jaisonlunar701@gmail.com', 985632245, 'test', 'testing', ''),
(10, ' test,', ' jaisonlunar701@gmail.com,', 9874563210, ' bike repair', ' test message,', '/uploads/contact/image_one.avif'),
(11, ' test,', ' jaisonlunar701@gmail.com,', 9874563210, ' bike repair', ' test message,', ''),
(12, 'alfin', 'alfinmshack18@gmail.com', 9747662524, 'Booking Issue', ' xjfimf', '/uploads/contact/1000441983.jpg'),
(13, 'Shafi', 'shafisadikh123@gmail.com', 8547160553, 'Booking Issue', 'qwerty', '/uploads/contact/5d018127-a014-4239-8371-eded7716d4c13512960685800663841.jpg'),
(14, 'Shafi', 'shafisadikh123@gmail.com', 8547160553, 'Payment Problem', 'asdfghjkl', '/uploads/contact/1000049370.jpg'),
(15, 'Shafi', 'shafisadikh123@gmail.com', 8547160553, 'Other', 'lmopq', '/uploads/contact/aa9ebb5e-3ba6-4e28-930c-7d788c303b305446306708172653980.jpg'),
(16, 'Alfin', 'msalfin188@gmail.com', 9562981626, 'Booking Issue', 'bxhd', '/uploads/contact/fdffa392-ffc3-4948-b30e-5ca8651d9cd22640011474380787484.jpg'),
(17, 'Alfin', 'msalfin188@gmail.com', 9562981626, 'Booking Issue', 'hfjd', '/uploads/contact/1000445395.png'),
(18, 'Alfin', 'msalfin188@gmail.com', 9562981626, 'Booking Issue', 'jfjd', '/uploads/contact/1000445395.png'),
(19, 'Alfin', 'msalfin188@gmail.com', 9562981626, 'Booking Issue', 'gxu', '/uploads/contact/1000445395.png'),
(20, ' test,', ' jaisonlunar701@gmail.com,', 9874563210, ' bike repair', ' test message,', ''),
(21, ' test,', ' jaisonlunar701@gmail.com,', 9874563210, ' bike repair', ' test message,', ''),
(22, ' test,', ' jaisonlunar701@gmail.com,', 9874563210, ' bike repair', ' test message,', ''),
(23, ' test,', ' jaisonlunar701@gmail.com,', 9874563210, ' bike repair', ' test message,', ''),
(24, ' test,', ' jaisonlunar701@gmail.com,', 9874563210, ' bike repair', ' test message,', ''),
(25, ' test,', ' jaisonlunar701@gmail.com,', 9874563210, ' bike repair', ' test message,', '/uploads/contact/image_one.avif'),
(26, ' test,', ' jaisonlunar701@gmail.com,', 9874563210, ' bike repair', ' test message,', '/uploads/contact/image_one.avif'),
(27, 'Shafizzz', 'shafisadikh123@gmail.com', 8547160553, 'Help', 'qwerty', '/uploads/contact/1000050548.jpg'),
(28, 'Shafizzz', 'shafisadikh123@gmail.com', 8547160553, 'Booking Issue', 'vyctcit', '/uploads/contact/1000050537.jpg'),
(29, ' test,', ' jaisonlunar701@gmail.com,', 9874563210, ' bike repair', ' test message,', ''),
(30, ' test,', ' jaisonlunar701@gmail.com,', 9874563210, ' bike repair', ' test message,', ''),
(31, ' test,', ' jaisonlunar701@gmail.com,', 9874563210, ' bike repair', ' test message,', ''),
(32, ' test,', ' jaisonlunar701@gmail.com,', 9874563210, ' bike repair', ' test message,', ''),
(33, 'alfin', 'alfinmshack18@gmail.com', 9562981629, 'Booking Issue', 'b', ''),
(34, ' test,', ' jaisonlunar701@gmail.com,', 9874563210, ' bike repair', ' test message,', ''),
(35, 'alfin', 'alfinmshack18@gmail.com', 9562981629, 'Booking Issue', 'j', ''),
(36, 'Shafi', 'shafisadikh123@gmail.com', 8547160553, 'Booking Issue', 'tftfy', '');

-- --------------------------------------------------------

--
-- Table structure for table `location_center`
--

CREATE TABLE `location_center` (
  `l_id` int(11) NOT NULL,
  `l_location` varchar(500) NOT NULL,
  `l_district` varchar(500) NOT NULL,
  `l_latitude` varchar(500) DEFAULT NULL,
  `l_longitude` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `location_center`
--

INSERT INTO `location_center` (`l_id`, `l_location`, `l_district`, `l_latitude`, `l_longitude`) VALUES
(19, 'ERANAKULAM NORTH', 'ERNAKULAM', NULL, NULL),
(20, 'VYTTILA', 'ERANAKULAM', NULL, NULL),
(21, 'THOPPUMPADI', 'ERANAKULAM', NULL, NULL),
(22, 'KUMBALAM', 'ERNAKULAM', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `n_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `role` varchar(500) NOT NULL,
  `type` varchar(500) NOT NULL,
  `message` varchar(500) NOT NULL,
  `status` varchar(500) NOT NULL DEFAULT 'active',
  `n_image` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`n_id`, `user_id`, `admin_id`, `role`, `type`, `message`, `status`, `n_image`) VALUES
(1, 2, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(2, 2, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(3, 1, 2, 'user', 'Booking rejected', 'Your booking has been rejected.', 'unread', NULL),
(4, 2, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(5, 2, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(6, 2, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(7, 2, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(8, 2, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(9, 2, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(10, 1, 2, 'user', 'Booking approved', 'Your booking has been approved.', 'unread', NULL),
(11, 1, 2, 'user', 'Booking onride', 'Your booking has been onride.', 'unread', NULL),
(12, 1, 2, 'user', 'Booking completed', 'Your booking has been completed.', 'unread', NULL),
(13, 9, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(14, 9, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(15, 2, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(16, 2, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(17, 1, 2, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(18, 2, 1, 'user', 'Booking', 'Your booking has been cancelled successfully.', 'unread', NULL),
(19, 1, 9, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(20, 6, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(21, 6, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(22, 6, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(23, 6, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(24, 1, 6, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(25, 1, 6, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(26, 1, 2, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(27, 6, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(28, 6, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(29, 6, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(30, 6, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(31, 1, 6, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(32, 1, 6, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(33, 1, 6, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(34, 1, 6, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(35, 2, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(36, 2, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(37, 1, 2, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(38, 1, 2, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(39, 1, 2, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(40, 2, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(41, 2, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(42, 1, 2, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(43, 1, 2, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(44, 1, 2, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(45, 1, 2, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(46, 1, 6, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(47, 6, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(48, 6, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(49, 6, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(50, 6, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(51, 2, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(52, 2, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(53, 6, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(54, 6, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(55, 1, 6, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(56, 1, 6, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(57, 1, 6, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(58, 1, 2, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(59, 1, 2, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(60, 1, 2, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(61, 1, 2, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(62, 1, 2, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(63, 1, 6, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(64, 1, 6, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(65, 6, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(66, 6, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(67, 1, 6, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(68, 15, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(69, 15, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(70, 1, 2, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(71, 9, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(72, 9, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(73, 1, 9, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(74, 1, 9, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(75, 1, 9, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(76, 9, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(77, 9, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(78, 1, 9, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(79, 1, 6, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(80, 1, 6, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(81, 1, 2, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(82, 1, 6, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(83, 1, 6, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(84, 1, 6, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(85, 1, 3, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(86, 1, 9, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(87, 1, 9, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(88, 1, 6, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(89, 1, 15, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(90, 15, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(91, 15, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(92, 1, 15, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(93, 1, 15, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(94, 1, 15, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(95, 1, 15, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(96, 1, 6, 'user', 'Booking', 'Your booking has been cancelled.', 'unread', NULL),
(97, 1, 15, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(98, 1, 6, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(99, 1, 16, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(100, 1, 18, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(101, 1, 15, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(102, 1, 15, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(103, 1, 21, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(104, 1, 21, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(105, 1, 21, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(106, 1, 21, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(107, 1, 21, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(108, 1, 21, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(109, 1, 21, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(110, 1, 21, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(111, 1, 21, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(112, 1, 21, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(113, 1, 21, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(114, 1, 21, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(115, 1, 22, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(116, 1, 23, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(117, 23, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(118, 23, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(119, 1, 23, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(120, 1, 21, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(121, 22, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(122, 22, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(123, 21, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(124, 21, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(125, 1, 22, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(126, 1, 22, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(127, 20, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(128, 20, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(129, 1, 22, 'user', 'Booking', 'Your booking has been cancelled.', 'unread', NULL),
(130, 1, 22, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(131, 1, 23, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(132, 1, 21, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(133, 1, 20, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(134, 1, 20, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(135, 1, 21, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(136, 1, 21, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(137, 1, 25, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(138, 26, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(139, 26, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(140, 1, 25, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(141, 1, 26, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(142, 1, 26, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(143, 1, 26, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(144, 1, 3, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(145, 1, 3, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(146, 1, 15, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(147, 1, 15, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(148, 1, 15, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(149, 1, 24, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(150, 1, 24, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(151, 1, 24, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(152, 1, 24, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(153, 1, 24, 'user', 'Booking', 'Your booking has been rejected.', 'unread', NULL),
(154, 28, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(155, 28, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(156, 1, 28, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(157, 1, 28, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(158, 1, 28, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(159, 27, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(160, 27, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(161, 1, 27, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(162, 1, 27, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(163, 1, 33, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(164, 1, 33, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(165, 1, 33, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(166, 1, 33, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(167, 1, 15, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(168, 1, 33, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL),
(169, 1, 33, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(170, 1, 33, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(171, 1, 33, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(172, 1, 23, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(173, 1, 21, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(174, 1, 22, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(175, 1, 20, 'user', 'Booking', 'Your booking has been completed.', 'unread', NULL),
(176, 35, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(177, 35, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(178, 1, 35, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(179, 42, 1, 'user', 'Booking', 'our ride has been successfully booked.', 'unread', NULL),
(180, 42, 1, 'user', 'payment', 'Your payment for the booking is successful!', 'unread', NULL),
(181, 1, 42, 'user', 'Booking', 'Your booking has been approved.', 'unread', NULL),
(182, 1, 42, 'user', 'Booking', 'Your booking has been onride.', 'unread', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `paymentHistory`
--

CREATE TABLE `paymentHistory` (
  `ph_id` int(11) NOT NULL,
  `ph_booking_id` int(11) NOT NULL,
  `ph_user_id` int(11) NOT NULL,
  `ph_bike_id` int(11) NOT NULL,
  `ph_rent_amount` decimal(10,2) NOT NULL,
  `ph_fine_amount` decimal(10,2) DEFAULT NULL,
  `ph_total_amount` decimal(10,2) NOT NULL,
  `ph_price_id` int(11) NOT NULL,
  `ph_booking_date` date NOT NULL,
  `ph_status` varchar(500) NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `paymentHistory`
--

INSERT INTO `paymentHistory` (`ph_id`, `ph_booking_id`, `ph_user_id`, `ph_bike_id`, `ph_rent_amount`, `ph_fine_amount`, `ph_total_amount`, `ph_price_id`, `ph_booking_date`, `ph_status`) VALUES
(1, 1, 6, 0, 587.75, 0.00, 587.75, 3, '2026-01-19', 'pending'),
(2, 2, 4, 0, 535.25, 0.00, 535.25, 2, '2026-01-19', 'pending'),
(3, 3, 2, 0, 455.11, 0.00, 455.11, 1, '2026-01-20', 'Paid'),
(4, 4, 2, 0, 455.11, 0.00, 455.11, 1, '2026-01-20', 'pending'),
(5, 5, 2, 0, 455.11, 0.00, 455.11, 1, '2026-01-20', 'pending'),
(6, 6, 2, 0, 455.11, 0.00, 455.11, 1, '2026-01-20', 'pending'),
(7, 7, 2, 0, 455.11, 0.00, 455.11, 1, '2026-01-20', 'pending'),
(8, 8, 2, 0, 455.11, 0.00, 455.11, 1, '2026-01-20', 'Paid'),
(9, 9, 2, 0, 455.11, 150.00, 605.11, 1, '2026-01-20', 'Paid'),
(10, 10, 2, 0, 692.75, 150.00, 842.75, 4, '2026-01-21', 'Paid'),
(11, 11, 9, 0, 535.25, 150.00, 685.25, 2, '2026-01-21', 'Paid'),
(12, 12, 2, 0, 535.25, 0.00, 535.25, 2, '2026-01-22', 'Paid'),
(13, 13, 6, 0, 692.75, 150.00, 842.75, 4, '2026-01-28', 'pending'),
(14, 14, 6, 0, 535.25, 0.00, 535.25, 2, '2026-02-05', 'Paid'),
(15, 15, 6, 0, 971.50, 149.00, 1120.50, 7, '2026-02-05', 'Paid'),
(16, 16, 6, 0, 587.75, 0.00, 587.75, 3, '2026-02-07', 'Paid'),
(17, 17, 6, 0, 535.25, 0.00, 535.25, 2, '2026-02-09', 'Paid'),
(18, 18, 2, 0, 455.11, 0.00, 455.11, 1, '2026-02-11', 'Paid'),
(19, 19, 2, 0, 455.11, 0.00, 455.11, 1, '2026-02-11', 'Paid'),
(20, 20, 6, 0, 535.25, 0.00, 535.25, 2, '2026-02-13', 'Paid'),
(21, 21, 6, 0, 587.75, 149.00, 736.75, 3, '2026-02-14', 'Paid'),
(22, 22, 2, 0, 455.11, 0.00, 455.11, 1, '2026-02-14', 'Paid'),
(23, 23, 6, 0, 455.11, 0.00, 455.11, 1, '2026-02-17', 'Paid'),
(24, 24, 6, 0, 535.25, 0.00, 535.25, 2, '2026-02-17', 'Paid'),
(25, 25, 15, 0, 455.11, 0.00, 455.11, 1, '2026-02-17', 'Paid'),
(26, 26, 9, 0, 455.11, 149.00, 604.11, 1, '2026-02-20', 'Paid'),
(27, 27, 9, 0, 455.11, 0.00, 455.11, 1, '2026-02-20', 'Paid'),
(28, 28, 9, 0, 455.11, 149.00, 604.11, 1, '2026-02-20', 'pending'),
(29, 29, 9, 0, 455.11, 149.00, 604.11, 1, '2026-02-20', 'pending'),
(30, 30, 3, 0, 455.11, 0.00, 455.11, 1, '2026-03-03', 'pending'),
(31, 31, 15, 0, 535.25, 0.00, 535.25, 2, '2026-03-03', 'pending'),
(32, 32, 15, 0, 535.25, 0.00, 535.25, 2, '2026-03-03', 'pending'),
(33, 33, 15, 0, 455.11, 0.00, 455.11, 1, '2026-03-04', 'Paid'),
(34, 34, 16, 0, 535.25, 0.00, 535.25, 2, '2026-03-04', 'pending'),
(35, 35, 18, 0, 455.11, 149.00, 604.11, 1, '2026-03-04', 'pending'),
(36, 36, 6, 0, 1039.75, 149.00, 1188.75, 8, '2026-03-05', 'pending'),
(37, 55, 24, 0, 455.11, 0.00, 455.11, 1, '2026-03-06', 'pending'),
(38, 56, 24, 0, 455.11, 0.00, 455.11, 1, '2026-03-06', 'pending'),
(39, 62, 3, 0, 455.11, 0.00, 455.11, 1, '2026-03-06', 'pending'),
(40, 76, 15, 0, 587.75, 0.00, 587.75, 3, '2026-03-06', 'pending'),
(41, 79, 3, 0, 7364.00, 0.00, 7364.00, 12, '2026-03-06', 'pending'),
(42, 80, 3, 0, 1822.50, 0.00, 1822.50, 9, '2026-03-06', 'pending'),
(43, 81, 3, 0, 1039.75, 0.00, 1039.75, 8, '2026-03-06', 'pending'),
(44, 87, 3, 0, 1822.50, 0.00, 1822.50, 9, '2026-03-06', 'pending'),
(45, 92, 3, 0, 1822.50, 0.00, 1822.50, 9, '2026-03-06', 'pending'),
(46, 94, 3, 0, 7364.00, 0.00, 7364.00, 12, '2026-03-06', 'pending'),
(47, 96, 3, 0, 1039.75, 0.00, 1039.75, 8, '2026-03-06', 'pending'),
(48, 100, 3, 0, 7364.00, 0.00, 7364.00, 12, '2026-03-06', 'pending'),
(49, 101, 3, 0, 7364.00, 0.00, 7364.00, 12, '2026-03-06', 'pending'),
(50, 102, 3, 0, 1281.12, 0.00, 1281.12, 13, '2026-03-06', 'pending'),
(51, 103, 6, 0, 1281.12, 0.00, 1281.12, 13, '2026-03-06', 'pending'),
(52, 104, 3, 0, 455.11, 0.00, 455.11, 1, '2026-03-06', 'pending'),
(53, 105, 23, 0, 1281.12, 0.00, 1281.12, 13, '2026-03-06', 'Paid'),
(54, 106, 22, 0, 1281.12, 0.00, 1281.12, 13, '2026-03-06', 'pending'),
(55, 107, 21, 0, 1281.12, 0.00, 1281.12, 13, '2026-03-06', 'Paid'),
(56, 108, 22, 0, 1281.12, 0.00, 1281.12, 13, '2026-03-06', 'Paid'),
(57, 109, 20, 0, 1281.12, 0.00, 1281.12, 13, '2026-03-06', 'Paid'),
(58, 110, 25, 0, 3660.50, 0.00, 3660.50, 10, '2026-03-06', 'pending'),
(59, 111, 26, 0, 3660.50, 0.00, 3660.50, 10, '2026-03-06', 'pending'),
(60, 112, 26, 0, 3660.50, 0.00, 3660.50, 10, '2026-03-06', 'Paid'),
(61, 113, 28, 0, 587.75, 0.00, 587.75, 3, '2026-03-07', 'Paid'),
(62, 114, 27, 0, 1822.50, 0.00, 1822.50, 9, '2026-03-07', 'Paid'),
(63, 115, 33, 0, 455.11, 0.00, 455.11, 1, '2026-03-07', 'pending'),
(64, 116, 33, 0, 455.11, 0.00, 455.11, 1, '2026-03-07', 'pending'),
(65, 117, 33, 0, 455.11, 0.00, 455.11, 1, '2026-03-07', 'pending'),
(66, 118, 35, 0, 535.25, 0.00, 535.25, 2, '2026-03-09', 'Paid'),
(67, 119, 42, 0, 692.75, 0.00, 692.75, 4, '2026-03-10', 'Paid');

-- --------------------------------------------------------

--
-- Table structure for table `rent_details`
--

CREATE TABLE `rent_details` (
  `rent_id` int(11) NOT NULL,
  `rent_duration` int(11) NOT NULL,
  `rent_duration_text` varchar(500) NOT NULL,
  `rent_amount` decimal(10,2) NOT NULL,
  `rent_gst` decimal(10,2) NOT NULL,
  `rent_deposit` decimal(10,2) NOT NULL,
  `rent_total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rent_details`
--

INSERT INTO `rent_details` (`rent_id`, `rent_duration`, `rent_duration_text`, `rent_amount`, `rent_gst`, `rent_deposit`, `rent_total`) VALUES
(1, 1, '1 Hour', 149.00, 7.11, 299.00, 455.11),
(2, 2, '2 Hour', 225.00, 11.25, 299.00, 535.25),
(3, 4, '4 Hour', 275.00, 13.75, 299.00, 587.75),
(4, 8, '8 Hour', 375.00, 18.75, 299.00, 692.75),
(7, 12, '12 Hour', 450.00, 22.50, 499.00, 971.50),
(8, 24, '1 Day', 515.00, 25.75, 499.00, 1039.75),
(9, 72, '3 Day', 1070.00, 53.50, 699.00, 1822.50),
(10, 168, '1 Week', 2630.00, 131.50, 899.00, 3660.50),
(12, 672, '1 MONTH', 6334.00, 131.00, 899.00, 7364.00),
(13, 48, '2 DAY', 750.00, 32.12, 499.00, 1281.12);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `u_id` int(11) NOT NULL,
  `u_name` varchar(500) NOT NULL,
  `u_email` varchar(500) NOT NULL,
  `u_password` varchar(500) NOT NULL,
  `u_mobile` bigint(11) NOT NULL,
  `u_address` varchar(500) NOT NULL,
  `u_state` varchar(500) NOT NULL,
  `u_district` varchar(500) NOT NULL,
  `u_pincode` int(11) NOT NULL,
  `u_joindate` date NOT NULL,
  `u_role` varchar(500) NOT NULL DEFAULT 'user',
  `u_token` int(11) DEFAULT NULL,
  `u_token_expiry` datetime DEFAULT NULL,
  `u_otp_status` varchar(500) NOT NULL DEFAULT 'unverified',
  `u_profile_pic` varchar(500) NOT NULL,
  `u_adharfront` varchar(500) NOT NULL,
  `u_addarback` varchar(500) NOT NULL,
  `u_licensefront` varchar(500) NOT NULL,
  `u_licenseback` varchar(500) NOT NULL,
  `u_dob` date DEFAULT NULL,
  `u_email_verify` varchar(500) NOT NULL DEFAULT 'false',
  `u_status` varchar(500) NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`u_id`, `u_name`, `u_email`, `u_password`, `u_mobile`, `u_address`, `u_state`, `u_district`, `u_pincode`, `u_joindate`, `u_role`, `u_token`, `u_token_expiry`, `u_otp_status`, `u_profile_pic`, `u_adharfront`, `u_addarback`, `u_licensefront`, `u_licenseback`, `u_dob`, `u_email_verify`, `u_status`) VALUES
(1, 'Admin', 'admin@gmail.com', '$2a$10$t8SmhYvJ.BUcMwOKhu4Q1ORhOtxEXHo/nuVoeGpoz1H.vh7oifcpK', 999999999, 'EasyGo ', 'Kerala', 'EKM', 999999, '2026-01-19', 'admin', NULL, NULL, 'unverified', '', '', '', '', '', '2026-01-01', 'true', 'active'),
(2, 'Shafi', 'shafisadikh123@gmail.com', '$2b$10$wYQCbrk1h4Gs2YehcEUzoOkST1HzWfVgDwVtgriEDcjxHbDCiFkM6', 8547160553, '', '', '', 0, '2026-01-19', 'user', NULL, '2026-01-22 04:56:05', 'unverified', '/uploads/profile/1000050548.jpg', 'uploads/adharcard/scaled_1000050548.jpg', 'uploads/adharcard/scaled_1000050548.jpg', '', '', '0000-00-00', 'true', 'active'),
(3, 'sambhu ', 'msambhunarayan07@gmail.com', '$2b$10$kR/DenqN7JkET13oSdBLEe4hwfBgKLwIMOjEFb0M1vZGIPJfv.xMm', 9249902771, '', '', '', 0, '2026-01-19', 'user', NULL, '2026-03-06 12:59:16', 'unverified', '', 'uploads/adharcard/scaled_1000290923.jpg', 'uploads/adharcard/scaled_1000290923.jpg', '', '', NULL, 'true', 'active'),
(4, 'sambhu', 'jaisonlunar701@gmail.com', '$2b$10$rUrdAz0YJEvs60yxw0HoSOAoZ4VZbF1wWj8DZG0BxF2O/8.AoJPwa', 8281787953, '', '', '', 0, '2026-01-19', 'user', NULL, '2026-01-19 07:29:28', 'unverified', '', 'uploads/adharcard/scaled_1000290923.jpg', 'uploads/adharcard/scaled_1000290923.jpg', '', '', NULL, 'true', 'active'),
(6, 'NIKHIL ', 'newtronservice96@gmail.com', '$2b$10$PdcMj/bWIhy.IrHmiRlsC.C/lcYtb0.iYO.bI9knzvkt8V64A/Pza', 9746477781, '', '', '', 0, '2026-01-19', 'user', NULL, '2026-01-23 02:48:24', 'unverified', '', 'uploads/adharcard/scaled_14785.jpg', 'uploads/adharcard/scaled_14786.jpg', '', '', NULL, 'true', 'active'),
(8, 'qwerty', 'zadiac1325@gmail.com', '$2b$10$aUhH6x/eW2EJsRZkAmk4WOIq81jse0Wh9YeoLiLXfsZno4Tx/oXKq', 9999999999, '', '', '', 0, '2026-01-20', 'user', NULL, '2026-01-20 06:44:11', 'unverified', '', 'uploads/adharcard/scaled_1000050548.jpg', 'uploads/adharcard/scaled_1000050548.jpg', '', '', '2026-01-20', 'true', 'active'),
(9, 'alfin', 'alfinmshack18@gmail.com', '$2b$10$GdBGa6IBFpClPtQIL5XEweAEOqV1cX8Qxpxt7ioIVLU5Ym8yNBUcq', 9562981629, '', '', '', 0, '2026-01-21', 'user', 1919, '2026-01-21 13:11:28', 'unverified', '/uploads/profile/1000467265.jpg', 'uploads/adharcard/scaled_1000450545.jpg', 'uploads/adharcard/scaled_1000450545.jpg', '', '', '0000-00-00', 'true', 'active'),
(11, 'Abcd', 'test123@gmail.com', '$2b$10$A2zEdiel84sCm8uXRSct6ejQNPdgzwIbmzyxcX8Rz.rvOqzN/0FYm', 7878787878, '', '', '', 0, '2026-01-22', 'user', 2693, '2026-01-22 04:49:12', 'unverified', '', 'uploads/adharcard/scaled_1000050548.jpg', 'uploads/adharcard/scaled_1000050548.jpg', '', '', NULL, 'false', 'active'),
(12, 'Alfin', 'glxydd@hk.bom', '$2b$10$btBrOUo/KhiVFZtcjXMzSey.H/hPw.eYcLMopJ.DmXkKkECi9xe0G', 9747662524, '', '', '', 0, '2026-01-22', 'user', 5582, '2026-01-22 06:30:03', 'unverified', '', 'uploads/adharcard/scaled_1000451318.jpg', 'uploads/adharcard/scaled_1000451108.png', '', '', NULL, 'false', 'active'),
(13, 'qqqqqq', 'abcd@gmail.com', '$2b$10$.rJbJwI7GBlZv7EDvswz8u25QvRDxwg7Ukj17XKeMXLVdZNpwh4/y', 2323232323, '', '', '', 0, '2026-01-22', 'user', 7803, '2026-01-22 06:45:46', 'unverified', '', 'uploads/adharcard/scaled_1000050548.jpg', 'uploads/adharcard/scaled_1000050548.jpg', '', '', NULL, 'false', 'active'),
(14, 'Hijas', 'mohdhijas.p47@gmail.com', '$2b$10$b.uRtffXwu5mAeVzqr5vOOrnqzpAV2nuNMlsFtgQ72.ENTXRGhpue', 9995013130, '', '', '', 0, '2026-01-28', 'user', NULL, '2026-02-14 11:56:35', 'unverified', '', 'uploads/adharcard/scaled_d3735bc8-4984-4802-a7db-e48775c51d69-1_all_8567.jpg', 'uploads/adharcard/scaled_d3735bc8-4984-4802-a7db-e48775c51d69-1_all_8567.jpg', '', '', NULL, 'true', 'active'),
(15, 'NIKHIL K S', 'santhoshnikhil96@gmail.com', '$2b$10$omgF7mg/ZZ3mQW/riSqLgO32H/WUH74.8qoiRiz/OOZTZowoY9YZW', 9446902129, '', '', '', 0, '2026-02-17', 'user', NULL, '2026-02-17 07:29:37', 'unverified', '', 'uploads/adharcard/scaled_1000492434.jpg', 'uploads/adharcard/scaled_1000492434.jpg', '', '', NULL, 'true', 'active'),
(16, 'subin', 'subinsubin62050@gmail.com', '$2b$10$U0JIpuUE.siIE8Q30EHqSuDC6cXo5E/r8QoYaNUrXHb8MzXY6yq8G', 6238970743, '', '', '', 0, '2026-03-04', 'user', NULL, '2026-03-06 12:48:18', 'unverified', '', 'uploads/adharcard/scaled_1000245246.jpg', 'uploads/adharcard/scaled_1000245247.jpg', '', '', NULL, 'true', 'active'),
(17, 'shyamlal', 'shyamlal418@gmail.com', '$2b$10$jcptN9Sybbd5zGxq7FYyheKPxul6YUHIuBPgBdUvBvAbqtOB7cR9e', 9746709399, '', '', '', 0, '2026-03-04', 'user', NULL, '2026-03-04 05:03:18', 'unverified', '', 'uploads/adharcard/scaled_1000905207.jpg', 'uploads/adharcard/scaled_1000904582.jpg', '', '', NULL, 'true', 'active'),
(18, 'Aleema', 'aleemaali815@gmail.com', '$2b$10$fMP7vnDaoJlF9zdANzuOKuvpRNQ76p/KLr.fCiQIe3j77Q10R6jIi', 8075090160, '', '', '', 0, '2026-03-04', 'user', NULL, '2026-03-04 06:39:31', 'unverified', '', 'uploads/adharcard/scaled_1000121427.jpg', 'uploads/adharcard/scaled_1000121424.jpg', '', '', NULL, 'true', 'active'),
(19, 'Hesten Alexi', 'hesten767@gmail.com', '$2b$10$JKj0m0dcUmTjrqZLZ/cO.uIwUPVUe7dVwXD6.dJO5T9Dg0Wmh3Vl2', 9497278487, '', '', '', 0, '2026-03-05', 'user', NULL, '2026-03-05 08:24:29', 'unverified', '', 'uploads/adharcard/scaled_1000172654.jpg', 'uploads/adharcard/scaled_1000172654.jpg', '', '', NULL, 'true', 'active'),
(20, 'Rojal ', 'rojaldhass01@gmail.com', '$2b$10$U96jagCYoK1cCjI7/XKguO6Y9GwwWfpcGFZw3dQTjSQcMgxQcKnfC', 6379183709, '', '', '', 0, '2026-03-06', 'user', NULL, '2026-03-06 12:30:21', 'unverified', '/uploads/profile/1000077752.jpg', 'uploads/adharcard/scaled_1000124633.png', 'uploads/adharcard/scaled_1000124633.png', '', '', '0000-00-00', 'true', 'active'),
(21, 'Seshanth Sivan', 'seshanth.sivan@gmail.com', '$2b$10$bYacfkH.RpezcPFp8DgPQ.Eh1B2pfxaTzLAV4ZUoRAp6qJrQIb6jS', 8098937495, '', '', '', 0, '2026-03-06', 'user', NULL, '2026-03-06 12:31:49', 'unverified', '/uploads/profile/fb7578e6-b04e-4475-a719-305ced13161c4120074562059071676.jpg', 'uploads/adharcard/scaled_47326.jpg', 'uploads/adharcard/scaled_47327.jpg', '', '', '0000-00-00', 'true', 'active'),
(22, 'Akash B', 'akashneymar1105@gmail.com', '$2b$10$2I7eK529B6lzA9bHXOWZCeY5AZk7aZ39U7Rd4jeyv2uuNX0Wp1Tee', 9047538228, '', '', '', 0, '2026-03-06', 'user', NULL, '2026-03-06 12:33:03', 'unverified', '/uploads/profile/e5fdcc03-a8aa-4c9c-84ae-32b4b66b1ed23066865441722403545.jpg', 'uploads/adharcard/scaled_1000054809.jpg', 'uploads/adharcard/scaled_1000054809.jpg', '', '', '2005-03-11', 'true', 'active'),
(23, 'Rithick S', 'rithick42005@gmail.com', '$2b$10$vha4IpjM/E/9pQaVh7Eb2u5xdSz/I.I3lEKsIgfNHLp4Tyk8dFXqW', 8778928398, '', '', '', 0, '2026-03-06', 'user', NULL, '2026-03-06 12:36:44', 'unverified', '', 'uploads/adharcard/scaled_1000491925.jpg', 'uploads/adharcard/scaled_1000491925.jpg', '', '', NULL, 'true', 'active'),
(24, 'Muhammad irfan', 'ikruikru46@gmail.com', '$2b$10$uC5839eKnlQuDDvz8m/RdO0JjD4sZYtWvT6GO.TUVLTvhTY/3bQJq', 6235706295, '', '', '', 0, '2026-03-06', 'user', NULL, '2026-03-06 12:48:32', 'unverified', '', 'uploads/adharcard/scaled_1000013790.jpg', 'uploads/adharcard/scaled_1000013790.jpg', '', '', NULL, 'true', 'active'),
(25, 'Abhiram ', 'abhiramaabhiram3@gmail.com', '$2b$10$KLtymnzm/2DGkRI9ns7leukJDnHVYAgJUzOxblsWc9GNF6S4W2fGC', 8590308921, '', '', '', 0, '2026-03-06', 'user', NULL, '2026-03-06 14:45:38', 'unverified', '', 'uploads/adharcard/scaled_1000299716.jpg', 'uploads/adharcard/scaled_1000299717.jpg', '', '', NULL, 'true', 'active'),
(26, 'felix cv', 'felix17xilef@gmail.com', '$2b$10$oE02EY1gQ2JY4XqNHyP4SuzKQkKJ53FOx9OyHAVoiye2rX4h26/L2', 9778326887, '', '', '', 0, '2026-03-06', 'user', NULL, '2026-03-06 14:47:01', 'unverified', '', 'uploads/adharcard/scaled_1000084193.jpg', 'uploads/adharcard/scaled_1000051585.jpg', '', '', NULL, 'true', 'active'),
(27, 'Midhun Ernesto ', 'pikemithu@gmail.com', '$2b$10$tMK7OxyV4kzP9OoqJKFp.e8wTQqHhbjAaauH.zVfv3yXxkIEcyBtK', 9847621279, '', '', '', 0, '2026-03-07', 'user', NULL, '2026-03-07 10:05:15', 'unverified', '/uploads/profile/1001526205.png', 'uploads/adharcard/scaled_1001531335.jpg', 'uploads/adharcard/scaled_1001531338.jpg', '', '', '0000-00-00', 'true', 'active'),
(28, 'Jithumon Manoj ', 'jithumanoj1992@gmail.com', '$2b$10$HkDEA6UgHObZ1M5L2JEpEOJ4wInKjI/XcEuaS/Txr54DqaLvUZ39K', 9207360499, '', '', '', 0, '2026-03-07', 'user', NULL, '2026-03-07 11:08:52', 'unverified', '', 'uploads/adharcard/scaled_1000212902.png', 'uploads/adharcard/scaled_1000212904.png', '', '', NULL, 'true', 'active'),
(29, 'suveen kb', 'suveen9961508330@gmail.com', '$2b$10$ySveTdGoctUF4Ct5zWKIj.a63jYf4oBAVzc9ekHum3CW8JMzH4Hvy', 9961508330, '', '', '', 0, '2026-03-07', 'user', NULL, '2026-03-07 16:31:28', 'unverified', '', 'uploads/adharcard/scaled_1000233626.jpg', 'uploads/adharcard/scaled_1000334208.jpg', '', '', NULL, 'true', 'active'),
(33, 'JOEL GEORGE ', 'joelvgeorge15@gmail.com', '$2b$10$Fm976uT10Tv9SNcaTOVGgOS95NE.20gdJIWSdvIkmjASgmd7NAOye', 8330899261, '', '', '', 0, '2026-03-07', 'user', NULL, '2026-03-07 19:22:07', 'unverified', '', 'uploads/adharcard/scaled_1000127827.jpg', 'uploads/adharcard/scaled_1000127828.jpg', '', '', NULL, 'true', 'active'),
(34, 'KB MOHAMMED FARIZ ', 'farizkannur067011@gmail.com', '$2b$10$DWbOzrotpBb01oiaOy40Me4qcvL/sOaaN1My6Su1JunKi7Bd1DHRG', 7795824845, '', '', '', 0, '2026-03-08', 'user', NULL, '2026-03-08 04:12:57', 'unverified', '', 'uploads/adharcard/scaled_1000000696.jpg', 'uploads/adharcard/scaled_1000011545.jpg', '', '', NULL, 'true', 'active'),
(35, 'umer', 'monaeiumer@gmail.com', '$2b$10$hYsPP5cXLbLt4LwBIodUSOiYmXuhtS0E3sgBtieiRIA87pEyXfMea', 7902681220, '', '', '', 0, '2026-03-09', 'user', NULL, '2026-03-09 09:23:05', 'unverified', '', 'uploads/adharcard/scaled_1000066765.jpg', 'uploads/adharcard/scaled_1000066766.jpg', '', '', NULL, 'true', 'active'),
(36, 'vignesh', 'vigneshsbhat21@gmail.com', '$2b$10$8UixFlWbUBJFf7koL4nPEOWf5ZZCmwXFf.4TxvgqLf/RG7eJQPVw2', 7025240142, '', '', '', 0, '2026-03-09', 'user', NULL, '2026-03-09 16:44:11', 'unverified', '', 'uploads/adharcard/scaled_1000165001.jpg', 'uploads/adharcard/scaled_1000165001.jpg', '', '', NULL, 'true', 'active'),
(37, 'Jithin k jaison', 'jithinkjaison9947@gmail.com', '$2b$10$GJIyg18I/b9pI4LFE1meo.Iw/cZmbykOGw0if8Zoy04SXdyyGkSZG', 9947095013, '', '', '', 0, '2026-03-09', 'user', NULL, '2026-03-09 17:44:34', 'unverified', '', 'uploads/adharcard/scaled_1000121495.jpg', 'uploads/adharcard/scaled_1000121509.jpg', '', '', NULL, 'true', 'active'),
(38, 'Shriram Ajith ', 'shriramajith07@gmail.com', '$2b$10$SaIABGokcTjlPOrPHtffV.i1oDlkvkdX1aVET4Qql7QvaV7/CZcAq', 9633151949, '', '', '', 0, '2026-03-09', 'user', NULL, '2026-03-09 17:46:51', 'unverified', '', 'uploads/adharcard/scaled_1000151649.jpg', 'uploads/adharcard/scaled_1000151648.jpg', '', '', NULL, 'true', 'active'),
(40, 'mohammed thaha ', 'mohammedthaha1030786@gmail.com', '$2b$10$koKkGlvIkDPKUB7MOsH6dupSYAzn6Ga2gUGVnmbGzL802jK.sZjP6', 8891107483, '', '', '', 0, '2026-03-09', 'user', NULL, '2026-03-09 18:31:43', 'unverified', '', 'uploads/adharcard/scaled_1000046689.jpg', 'uploads/adharcard/scaled_1000046690.jpg', '', '', NULL, 'true', 'active'),
(41, 'stephin', 'stephinjacob007@gmail.com', '$2b$10$8KYjlqOagZQezYY1ipUGNO63uehcTUMq7GQ4zxg9X0IywU.d4p/TC', 6235678677, '', '', '', 0, '2026-03-09', 'user', NULL, '2026-03-09 20:43:23', 'unverified', '', 'uploads/adharcard/scaled_1000268604.jpg', 'uploads/adharcard/scaled_1000268483.jpg', '', '', NULL, 'true', 'active'),
(42, 'Niranjan ', 'niranjan007patil@gmail.com', '$2b$10$uY6IsTqaOHp1t88qHqVu8eSE4cXOOaWG94IB/Oz3IvVmOpO2gUL1G', 9353096303, '', '', '', 0, '2026-03-10', 'user', NULL, '2026-03-10 04:10:48', 'unverified', '', 'uploads/adharcard/scaled_1000368615.jpg', 'uploads/adharcard/scaled_1000368618.jpg', '', '', NULL, 'true', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `user_token`
--

CREATE TABLE `user_token` (
  `ut_id` int(11) NOT NULL,
  `ut_u_id` int(11) NOT NULL,
  `ut_token` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_token`
--

INSERT INTO `user_token` (`ut_id`, `ut_u_id`, `ut_token`) VALUES
(1, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoyLCJlbWFpbCI6InNoYWZpc2FkaWtoMTIzQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzcxMDU2MTk0LCJleHAiOjE3NzEwNjMzOTR9.GKC3-42PCBcgSjG0cWuLHJrOVjAsC14o1j3HiaojY84'),
(2, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoxLCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MzExNTU0MCwiZXhwIjoxNzczMTIyNzQwfQ.R8M1oC_TxNjd3PXnNZWXxDhaW0euL6qvi5-XFOmoD7I'),
(3, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjozLCJlbWFpbCI6Im1zYW1iaHVuYXJheWFuMDdAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzI4MDE3MjYsImV4cCI6MTc3MjgwODkyNn0.t6GxqCB7VTqt9D3Q95jTMSeQuiY6vsXiOKlrEz-_yY4'),
(4, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjo0LCJlbWFpbCI6Im1zYW1iaHVuYXJheWFuQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzY4ODIwNDA0LCJleHAiOjE3Njg4Mjc2MDR9.a50fubwBAIwMWve-Q1pVCZRKsPQd5vd34DOjQJXiULE'),
(5, 6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjo2LCJlbWFpbCI6Im5ld3Ryb25zZXJ2aWNlOTZAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzI4MDAzMTEsImV4cCI6MTc3MjgwNzUxMX0.9JE2cZjpThaxwWgu8Fo9XgP6EVjWqzRSIanPjZ_QwR0'),
(6, 8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjo4LCJlbWFpbCI6InphZGlhYzEzMjVAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3Njg4OTQyNTQsImV4cCI6MTc2ODkwMTQ1NH0.OTuxo6eZkw3Os6okdWyjNEumMSIhvk4JZVDi5JY7EF4'),
(7, 9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjo5LCJlbWFpbCI6ImFsZmlubXNoYWNrMThAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzI4MDAzNzgsImV4cCI6MTc3MjgwNzU3OH0.oGVDnVymYnWBJmMntTZcM5lkF-MlRgRjkopYw5tIeVg'),
(8, 14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoxNCwiZW1haWwiOiJtb2hkaGlqYXMucDQ3QGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzcxMDc1NzIyLCJleHAiOjE3NzEwODI5MjJ9.2yAJwtvg4F0KMAK-HkWd0nrZK2ivcsOp22D4dUoFJJQ'),
(9, 15, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoxNSwiZW1haWwiOiJzYW50aG9zaG5pa2hpbDk2QGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzcyODAyMTk2LCJleHAiOjE3NzI4MDkzOTZ9.33zrtlY4fIuT5Hlt9jNb7NLR1CLPAPKswoP-JuvXGTI'),
(10, 16, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoxNiwiZW1haWwiOiJzdWJpbnN1YmluNjIwNTBAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzI1OTk4MzAsImV4cCI6MTc3MjYwNzAzMH0.p_xqa1eb9fvsR1Rxs0wLW9Ns0VXrlTgJ7DwHhW5bRkk'),
(11, 17, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoxNywiZW1haWwiOiJzaHlhbWxhbDQxOEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc3MjYwMDA3NiwiZXhwIjoxNzcyNjA3Mjc2fQ.XDfjj0KbAMJDidJLh-l-QWmGaHjZtq28aSBmfd8x2Xg'),
(12, 18, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoxOCwiZW1haWwiOiJhbGVlbWFhbGk4MTVAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzI2MDU4MDgsImV4cCI6MTc3MjYxMzAwOH0.guDEnBFpFJxJFXubIZb-xwrWRvCWkXYf_AXWRRCDXz8'),
(13, 19, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoxOSwiZW1haWwiOiJoZXN0ZW43NjdAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzI2OTg1MDQsImV4cCI6MTc3MjcwNTcwNH0.zMqW1tE2ConlHu72yGWuaul6vBIQ_x5-Ya9Bur917_Y'),
(14, 20, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoyMCwiZW1haWwiOiJyb2phbGRoYXNzMDFAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzI3OTk3NTYsImV4cCI6MTc3MjgwNjk1Nn0.yp5DACSCxGK5YMFw1Oql83n9lweFVROZhH9rtSbYR7A'),
(15, 21, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoyMSwiZW1haWwiOiJzZXNoYW50aC5zaXZhbkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc3Mjc5OTc3MCwiZXhwIjoxNzcyODA2OTcwfQ.pKprMi4ZShC50jdHwLQGCyRWsfY0vjWCZirI10Znm2Y'),
(16, 22, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoyMiwiZW1haWwiOiJha2FzaG5leW1hcjExMDVAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzI3OTk4NDUsImV4cCI6MTc3MjgwNzA0NX0.TkzjM6BsVS4JCFxh5PlDgMKbhxH2X5Tzl-NUYcggy6I'),
(17, 23, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoyMywiZW1haWwiOiJyaXRoaWNrNDIwMDVAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzI4MDAwNTEsImV4cCI6MTc3MjgwNzI1MX0.khXW7ytOdtKpnMHss5lYHXNxlV_fvMkMdSwTG0F5hQo'),
(18, 24, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoyNCwiZW1haWwiOiJpa3J1aWtydTQ2QGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzcyODAxMjczLCJleHAiOjE3NzI4MDg0NzN9.6fSSvYPvgYmGH7q3dV3NM1WCrzKBFv-HrqsGXi6HwNQ'),
(19, 25, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoyNSwiZW1haWwiOiJhYmhpcmFtYWFiaGlyYW0zQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzcyODA3ODA3LCJleHAiOjE3NzI4MTUwMDd9.80Nq5OUgrUt4kXOjfs4b9iYuupKz6NainO46v9nO_iw'),
(20, 26, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoyNiwiZW1haWwiOiJmZWxpeDE3eGlsZWZAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzI4MDgyMDUsImV4cCI6MTc3MjgxNTQwNX0.gG38UQ6cpfBMa5KjRkjxGKKwuqOFdh_OuzkCYaiXMro'),
(21, 27, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoyNywiZW1haWwiOiJwaWtlbWl0aHVAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzI4OTY2ODUsImV4cCI6MTc3MjkwMzg4NX0.kJzoYRVjBtZubghhDF6W9Zxn6FT3gJEMhLr2inQvCgY'),
(22, 28, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoyOCwiZW1haWwiOiJqaXRodW1hbm9qMTk5MkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc3Mjg4MTE3MywiZXhwIjoxNzcyODg4MzczfQ.9Qo4RKAZg7-xHujYYhb9bFaVc5Wj14iv2e_JOejLVOc'),
(23, 29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjoyOSwiZW1haWwiOiJzdXZlZW45OTYxNTA4MzMwQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzcyOTAwNTM1LCJleHAiOjE3NzI5MDc3MzV9.ZBj1_AefGyJw8M2G7Zklm4OzzRNVkTrqf2UwUYqlzT8'),
(24, 33, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjozMywiZW1haWwiOiJqb2Vsdmdlb3JnZTE1QGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzcyOTExMzQ0LCJleHAiOjE3NzI5MTg1NDR9.id5IzgAU-dng2jCfOszLbFJRnsbK_aCgzzBue1KYLvQ'),
(25, 34, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjozNCwiZW1haWwiOiJmYXJpemthbm51cjA2NzAxMUBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc3Mjk0MjcwMiwiZXhwIjoxNzcyOTQ5OTAyfQ.9ZL8lIY4_VTpRMipV4GGGNOD06cMXcuBi_xPQKSzYJk'),
(26, 35, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjozNSwiZW1haWwiOiJtb25hZWl1bWVyQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzczMDQ3NjI3LCJleHAiOjE3NzMwNTQ4Mjd9.7miRLk5sx4j4NSX4VULXFa9HAZpFVl18jUv5SvxMlsI'),
(27, 36, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjozNiwiZW1haWwiOiJ2aWduZXNoc2JoYXQyMUBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc3MzA3NDEyNSwiZXhwIjoxNzczMDgxMzI1fQ.jmBL-DrCx94DqlwY-JCAm_gDpK7VtK9Y6lIbajWlCHk'),
(28, 37, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjozNywiZW1haWwiOiJqaXRoaW5ramFpc29uOTk0N0BnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc3MzA3Nzc0OSwiZXhwIjoxNzczMDg0OTQ5fQ.fiaITeo54rTdcfWmDpjxt1oi9yZrCVVzHIVXryXT2gw'),
(29, 38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjozOCwiZW1haWwiOiJzaHJpcmFtYWppdGgwN0BnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc3MzA3Nzg2MSwiZXhwIjoxNzczMDg1MDYxfQ.TMLuw0UoE-CcUVZ75MkLusaHufAwRynWMHDP8iJdEEw'),
(30, 40, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjo0MCwiZW1haWwiOiJtb2hhbW1lZHRoYWhhMTAzMDc4NkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc3MzA4MDU0MSwiZXhwIjoxNzczMDg3NzQxfQ.MOFrCvsu6lgP1u4AIKMGSkKO7VRkqXYuK9kJOGLj13E'),
(31, 41, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjo0MSwiZW1haWwiOiJzdGVwaGluamFjb2IwMDdAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzMwODg0NTQsImV4cCI6MTc3MzA5NTY1NH0.KZCq0Qv15Q3JSwzV7Fr3zqrhvUbM8vLYqLL5CIdMxNc'),
(32, 42, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1X2lkIjo0MiwiZW1haWwiOiJuaXJhbmphbjAwN3BhdGlsQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzczMTE1Mjg3LCJleHAiOjE3NzMxMjI0ODd9.3SW3_tz0kqLNonLNlj80ooxZJxG57OriLJ4TO8Pe6BY');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bikes`
--
ALTER TABLE `bikes`
  ADD PRIMARY KEY (`b_id`);

--
-- Indexes for table `bike_centers`
--
ALTER TABLE `bike_centers`
  ADD PRIMARY KEY (`bc_id`);

--
-- Indexes for table `bike_images`
--
ALTER TABLE `bike_images`
  ADD PRIMARY KEY (` img_id`);

--
-- Indexes for table `bike_reviews`
--
ALTER TABLE `bike_reviews`
  ADD PRIMARY KEY (`br_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`b_id`);

--
-- Indexes for table `ContactUs`
--
ALTER TABLE `ContactUs`
  ADD PRIMARY KEY (`c_id`);

--
-- Indexes for table `location_center`
--
ALTER TABLE `location_center`
  ADD PRIMARY KEY (`l_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`n_id`);

--
-- Indexes for table `paymentHistory`
--
ALTER TABLE `paymentHistory`
  ADD PRIMARY KEY (`ph_id`);

--
-- Indexes for table `rent_details`
--
ALTER TABLE `rent_details`
  ADD PRIMARY KEY (`rent_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`u_id`);

--
-- Indexes for table `user_token`
--
ALTER TABLE `user_token`
  ADD PRIMARY KEY (`ut_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bikes`
--
ALTER TABLE `bikes`
  MODIFY `b_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `bike_centers`
--
ALTER TABLE `bike_centers`
  MODIFY `bc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=175;

--
-- AUTO_INCREMENT for table `bike_images`
--
ALTER TABLE `bike_images`
  MODIFY ` img_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `bike_reviews`
--
ALTER TABLE `bike_reviews`
  MODIFY `br_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `b_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=120;

--
-- AUTO_INCREMENT for table `ContactUs`
--
ALTER TABLE `ContactUs`
  MODIFY `c_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `location_center`
--
ALTER TABLE `location_center`
  MODIFY `l_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `n_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=183;

--
-- AUTO_INCREMENT for table `paymentHistory`
--
ALTER TABLE `paymentHistory`
  MODIFY `ph_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `rent_details`
--
ALTER TABLE `rent_details`
  MODIFY `rent_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `u_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `user_token`
--
ALTER TABLE `user_token`
  MODIFY `ut_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
