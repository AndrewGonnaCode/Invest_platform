# 🚀 Web3 Crowdfunding Platform

A decentralized crowdfunding platform built with **NestJS**, **PostgreSQL**, **Redis**, **Kafka**, and **Ethereum** smart contracts. This platform enables users to create and fund campaigns using cryptocurrency with wallet-based authentication.

## 🏗️ Architecture

- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis for sessions and performance optimization
- **Message Queue**: Apache Kafka for asynchronous processing
- **Blockchain**: Ethereum integration with Ethers.js
- **Authentication**: Wallet-based (SIWE-style) authentication
- **Containerization**: Docker & Docker Compose

## ✨ Features

### 🔐 Authentication & Authorization
- Wallet-based authentication using Sign-In with Ethereum (SIWE)
- Role-based access control (RBAC)
- Session management with Redis

### 💰 Campaign Management
- Create fundraising campaigns with smart contracts
- Campaign factory pattern for deployment
- Real-time campaign status tracking
- Event synchronization with blockchain

### 🎯 Contribution System
- Secure cryptocurrency contributions
- Asynchronous transaction processing with Kafka
- Transaction confirmation and status updates
- Contribution history and analytics

### 🔄 Event Processing
- Real-time blockchain event listening
- Kafka-based message queuing system
- Automatic campaign state synchronization
- Failed transaction handling and retry logic

### 📊 Additional Features
- Price feeds integration (CoinGecko API)
- Trending campaigns algorithm
- Comprehensive API documentation (Swagger)
- Database migrations and seeding

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | NestJS |
| **Language** | TypeScript |
| **Database** | PostgreSQL |
| **ORM** | TypeORM |
| **Cache** | Redis |
| **Message Queue** | Apache Kafka |
| **Blockchain** | Ethereum (Ethers.js) |
| **Containerization** | Docker |
| **API Docs** | Swagger/OpenAPI |

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone [https://github.com/AndrewGonnaCode/Invest_platform.git](https://github.com/AndrewGonnaCode/Invest_platform.git)
cd crowdfunding