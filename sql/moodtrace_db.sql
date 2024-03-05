-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 28, 2024 at 10:37 PM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `moodtrace_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `contextual_trigger`
--

CREATE TABLE `contextual_trigger` (
  `trigger_id` int(11) NOT NULL,
  `trigger_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `contextual_trigger`
--

INSERT INTO `contextual_trigger` (`trigger_id`, `trigger_name`) VALUES
(1, 'Weather'),
(2, 'Work'),
(3, 'Exercise'),
(4, 'Family'),
(5, 'School'),
(6, 'Sleep'),
(7, 'Date'),
(8, 'Food'),
(9, 'Promotion'),
(10, 'Relationships'),
(11, 'Holiday'),
(12, 'Special Occasion');

-- --------------------------------------------------------

--
-- Table structure for table `snapshot`
--

CREATE TABLE `snapshot` (
  `snapshot_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `enjoyment_level` int(11) NOT NULL,
  `sadness_level` int(11) NOT NULL,
  `anger_level` int(11) NOT NULL,
  `contempt_level` int(11) NOT NULL,
  `disgust_level` int(11) NOT NULL,
  `fear_level` int(11) NOT NULL,
  `surprise_level` int(11) NOT NULL,
  `date_time` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `snapshot`
--

INSERT INTO `snapshot` (`snapshot_id`, `user_id`, `enjoyment_level`, `sadness_level`, `anger_level`, `contempt_level`, `disgust_level`, `fear_level`, `surprise_level`, `date_time`) VALUES
(789, 11, 6, 4, 4, 5, 4, 6, 6, '2024-02-28 12:00:00.000000'),
(790, 11, 7, 2, 2, 2, 3, 2, 3, '2024-02-29 12:00:00.000000'),
(791, 11, 6, 6, 4, 4, 4, 4, 3, '2024-03-01 12:00:00.000000'),
(792, 11, 6, 6, 6, 6, 6, 6, 6, '2024-02-28 12:00:00.000000'),
(793, 11, 5, 5, 5, 5, 5, 5, 5, '2024-03-02 12:00:00.000000');

-- --------------------------------------------------------

--
-- Table structure for table `snapshot_trigger`
--

CREATE TABLE `snapshot_trigger` (
  `snapshot_trigger_id` int(11) NOT NULL,
  `snapshot_id` int(11) NOT NULL,
  `trigger_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `firstname` text NOT NULL,
  `surname` text NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `password` varbinary(255) NOT NULL,
  `reset_token` varbinary(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `firstname`, `surname`, `email_address`, `password`, `reset_token`) VALUES
(1, 'Dell', 'Reilly', 'dell.reilly@ethereal.email', 0x243262243130245844376c4852454a46512e4b3674617656546562532e5762593363376241547a6a2e73796d6e6a304d7472337a2e30673262744c71, 0x66636163373839623035666164363539316439363435393436636134653034653863333637393864),
(11, 'Aidan', 'Moore', 'Aidan668@hotmail.com', 0x243262243130246a416d74375357394776794c71786f7a716671356a2e3979566a6d572e6a4c2e6a4e4b76686a577147386b6d61567a616a4f663361, 0x62633961383830373263643834633337306333653137363835633937313262613830636666656236);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contextual_trigger`
--
ALTER TABLE `contextual_trigger`
  ADD PRIMARY KEY (`trigger_id`);

--
-- Indexes for table `snapshot`
--
ALTER TABLE `snapshot`
  ADD PRIMARY KEY (`snapshot_id`),
  ADD KEY `fk_user_user_id` (`user_id`);

--
-- Indexes for table `snapshot_trigger`
--
ALTER TABLE `snapshot_trigger`
  ADD PRIMARY KEY (`snapshot_trigger_id`),
  ADD KEY `FK_snapshot_trigger_snapshot_id` (`snapshot_id`),
  ADD KEY `FK_snapshot_trigger_trigger_id` (`trigger_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contextual_trigger`
--
ALTER TABLE `contextual_trigger`
  MODIFY `trigger_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `snapshot`
--
ALTER TABLE `snapshot`
  MODIFY `snapshot_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=794;

--
-- AUTO_INCREMENT for table `snapshot_trigger`
--
ALTER TABLE `snapshot_trigger`
  MODIFY `snapshot_trigger_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2663;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=170;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `snapshot`
--
ALTER TABLE `snapshot`
  ADD CONSTRAINT `fk_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `snapshot_trigger`
--
ALTER TABLE `snapshot_trigger`
  ADD CONSTRAINT `FK_snapshot_trigger_snapshot_id` FOREIGN KEY (`snapshot_id`) REFERENCES `snapshot` (`snapshot_id`),
  ADD CONSTRAINT `FK_snapshot_trigger_trigger_id` FOREIGN KEY (`trigger_id`) REFERENCES `contextual_trigger` (`trigger_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
