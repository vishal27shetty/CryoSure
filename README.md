# CryoSure: Real-time Cold Chain Anomaly Detection

[![AWS Lambda](https://img.shields.io/badge/AWS-Lambda-orange?logo=amazon-aws)](https://aws.amazon.com/lambda/)
[![Serverless](https://img.shields.io/badge/Architecture-Serverless-blue)](https://aws.amazon.com/serverless/)
[![React](https://img.shields.io/badge/Frontend-React-61dafb?logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Backend-Python-3776ab?logo=python)](https://python.org/)

## 🏆 AWS Lambda Hackathon Submission

**CryoSure** is a serverless, real-time cold chain monitoring solution built entirely on AWS Lambda and integrated services. It addresses the critical business problem of maintaining optimal environmental conditions for perishable goods during storage and transit.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [The Real-World Business Problem](#the-real-world-business-problem)
- [Solution Architecture](#solution-architecture)
- [AWS Lambda as Core Service](#aws-lambda-as-core-service)
- [Features](#features)
- [AWS Services Used](#aws-services-used)
- [Setup Guide](#setup-guide)
- [API Documentation](#api-documentation)
- [Testing & Demo](#testing--demo)
- [Architecture Diagram](#architecture-diagram)
- [Judging Criteria Alignment](#judging-criteria-alignment)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Project Overview

CryoSure leverages the power of AWS Lambda as its core compute engine, demonstrating its versatility in handling event-driven processing, API interactions, and data management in a highly scalable and cost-effective manner.

### Key Highlights

- **100% Serverless**: Built entirely on AWS managed services
- **Real-time Processing**: Event-driven anomaly detection with sub-second response times
- **Dynamic Configuration**: Web-based threshold management without code changes
- **Scalable Architecture**: Handles from single devices to enterprise-scale deployments
- **Cost-Effective**: Pay-per-use model with no idle compute costs

## 🚨 The Real-World Business Problem

The cold chain industry faces immense challenges in ensuring temperature-sensitive goods remain within specific environmental parameters. Deviations, even minor ones, can lead to:

- **Product Spoilage**: Direct financial losses from compromised goods
- **Compromised Efficacy/Safety**: Critical for pharmaceuticals and vaccines
- **Regulatory Non-compliance**: Fines and reputational damage
- **Inefficient Operations**: Manual monitoring prone to error and delayed responses

CryoSure provides an automated, proactive solution offering real-time visibility and immediate alerts when conditions deviate from defined safety thresholds.

## 🏗️ Solution Architecture

CryoSure follows a fully serverless architecture designed for high availability, scalability, and minimal operational overhead.

### Architecture Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React.js SPA (Frontend)                   │   │
│  │  • Configuration Interface                              │   │
│  │  • Real-time Monitoring Dashboard                      │   │
│  │  • Anomaly Visualization                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AWS Cloud Backend                          │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │ Data Ingestion  │    │ Configuration   │    │ Data Display│ │
│  │                 │    │ Management      │    │             │ │
│  │ IoT Simulator   │───▶│ API Gateway     │───▶│ API Gateway │ │
│  │ (Python)        │    │ (Config API)    │    │ (Data API)  │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
│           │                       │                    │        │
│           ▼                       ▼                    ▼        │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   AWS IoT Core  │    │   AWS Lambda    │    │ AWS Lambda  │ │
│  │                 │    │ (Config Update) │    │(Data Fetch) │ │
│  │ • MQTT Broker   │    └─────────────────┘    └─────────────┘ │
│  │ • Device Auth   │              │                    │        │
│  │ • Message Route │              ▼                    ▼        │
│  └─────────────────┘    ┌─────────────────┐    ┌─────────────┐ │
│           │              │   DynamoDB      │    │  DynamoDB   │ │
│           ▼              │ (Config Table)  │    │(Sensor Data)│ │
│  ┌─────────────────┐    └─────────────────┘    └─────────────┘ │
│  │   AWS Lambda    │                                     │     │
│  │(Anomaly Detect) │                                     │     │
│  └─────────────────┘                                     │     │
│           │                                              │     │
│           ▼                                              │     │
│  ┌─────────────────┐    ┌─────────────────┐              │     │
│  │   DynamoDB      │    │   Amazon SNS    │              │     │
│  │(Sensor Data)    │    │  (Alerts)       │              │     │
│  └─────────────────┘    └─────────────────┘              │     │
│           │                       │                       │     │
│           └───────────────────────┼───────────────────────┘     │
│                                   ▼                             │
│                          ┌─────────────────┐                   │
│                          │ CloudWatch Logs │                   │
│                          └─────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

- **Serverless First**: All compute, storage, and messaging are managed services
- **Event-Driven**: Core anomaly detection triggered by IoT events
- **API-Driven**: Frontend interacts through REST APIs only
- **Separation of Concerns**: Distinct Lambda functions for different responsibilities
- **Dynamic Configuration**: Thresholds configurable via frontend
- **Auto-Scaling**: All components scale automatically with demand
- **Cost-Effective**: Pay-per-use model across all services
- **Secure**: IAM roles with least privilege, certificate-based IoT auth

## ⚡ AWS Lambda as Core Service

AWS Lambda is the serverless compute backbone of the CryoSure application. It executes all backend business logic without requiring any server management. The entire workflow, from real-time data ingestion and analysis to user-driven configuration and data presentation, is orchestrated by a set of targeted, event-driven Lambda functions.

### How AWS Lambda is Used: A Deep Dive

CryoSure's architecture showcases three distinct and powerful patterns of Lambda usage, each triggered differently to handle a specific part of the application's functionality.

#### 1. `CryosureAnomalyDetector`: The Real-time Analysis Engine

This is the most critical function in the system, acting as the real-time brain that processes every sensor reading.

*   **Trigger**: **AWS IoT Core Rule**. This function is invoked asynchronously every time a new message is published to the `coldchain/sensors/data` MQTT topic. This event-driven pattern ensures immediate processing with zero idle cost.

*   **In-depth Logic & Data Flow**:
    1.  **Dynamic Configuration Loading**: Upon invocation, the function first queries the `CryosureColdStorageConfig` DynamoDB table for the single item with the partition key `CURRENT_ACTIVE_THRESHOLDS`. This allows the anomaly detection logic to use the *very latest* thresholds set by the user via the frontend, making the system highly adaptable without requiring a code deployment. If no configuration is found, it falls back to safe, hardcoded defaults.
    2.  **Real-time Analysis**: It compares the incoming `temperature` and `humidity` values from the IoT payload against the dynamically loaded `minTemp`, `maxTemp`, and `maxHumidity` thresholds.
    3.  **Data Enrichment & Persistence**: The function enriches the raw sensor data with crucial metadata: `isAnomaly` (a boolean flag) and `anomalyDetails` (a list of human-readable reasons for the anomaly). This enriched record is then immediately saved to the `ColdChainSensorData` DynamoDB table, creating an immutable historical log.
    4.  **Instant Alerting**: If `isAnomaly` is true, the function constructs a detailed, formatted alert message and publishes it directly to the `CryosureAnomalyAlerts` Amazon SNS topic. This triggers immediate email/SMS notifications to stakeholders, enabling rapid response to critical events.

#### 2. `UpdateColdStorageConfigLambda`: The System's Control Plane

This function provides the crucial link between the user and the system's operational parameters, acting as a secure and controlled "control plane."

*   **Trigger**: **Amazon API Gateway (`POST /config`)**. This function is invoked synchronously when the user saves a new configuration from the React frontend.

*   **In-depth Logic & Data Flow**:
    1.  **API-Driven Interaction**: It receives the new threshold values (`storageType`, `minTemp`, `maxTemp`, `maxHumidity`) directly from the API Gateway event body.
    2.  **Singleton Configuration Pattern**: A key design choice is implemented here. The function uses `put_item` with a **fixed partition key** (`CURRENT_ACTIVE_THRESHOLDS`) on the `CryosureColdStorageConfig` table. This elegant pattern ensures that there is only ever **one** official, active configuration item for the entire system, which the `CryosureAnomalyDetector` function reads from. This is a robust way to manage global application state.
    3.  **Data Validation**: It performs basic validation to ensure all required fields are present in the payload from the frontend.

#### 3. `GetSensorDataLambda`: The Frontend's Data Provider

This function serves as the backend-for-frontend (BFF), responsible for fetching and formatting data for the live monitoring dashboard.

*   **Trigger**: **Amazon API Gateway (`GET /sensordata`)**. This function is invoked synchronously whenever the frontend dashboard requests a data refresh.

*   **In-depth Logic & Data Flow**:
    1.  **Data Retrieval**: It performs a `scan` operation on the `ColdChainSensorData` DynamoDB table to retrieve the most recent sensor readings (limited to 20 for performance).
    2.  **In-Memory Sorting**: To ensure the frontend displays the very latest data first, the function sorts the retrieved items in reverse chronological order based on their `timestamp`.
    3.  **Data Type Serialization**: A common challenge with DynamoDB is that it stores numbers as a high-precision `Decimal` type, which is not native to JSON. The function uses a helper class, `DecimalEncoder`, to correctly serialize these values into standard floats, preventing errors and ensuring frontend compatibility.
    4.  **CORS Handling**: It explicitly includes `Access-Control-Allow-Origin: *` and other necessary CORS headers in its response, making it accessible to the web application hosted on a different domain.

### 🔧 Lambda Function Specifications

| Function                      | Runtime    | Memory | Timeout | Triggers        | Purpose                        |
| ----------------------------- | ---------- | ------ | ------- | --------------- | ------------------------------ |
| `CryosureAnomalyDetector`       | Python 3.9 | 256 MB | 30s     | IoT Core Rule   | Anomaly detection & alerting   |
| `UpdateColdStorageConfigLambda` | Python 3.9 | 128 MB | 10s     | API Gateway     | Configuration management       |
| `GetSensorDataLambda`         | Python 3.9 | 128 MB | 10s     | API Gateway     | Data retrieval for frontend    |

### 🚀 Lambda Benefits Demonstrated
- **Zero Infrastructure Management**: No servers to provision or maintain.
- **Automatic Scaling**: Handles traffic spikes from a few sensors to millions without intervention.
- **Pay-Per-Use Model**: Costs are incurred only when data is being processed.
- **Event-Driven Architecture**: Functions respond instantly to IoT events and API calls.
- **Seamless Integration**: Each function acts as "glue" between other AWS services (IoT, DynamoDB, SNS, API Gateway).

## 🚀 Features

### Core Features
- ✅ **Real-time Sensor Data Ingestion**: Secure MQTT-based data collection
- ✅ **Dynamic Anomaly Thresholds**: Web-configurable temperature and humidity limits
- ✅ **Automated Anomaly Detection**: Lambda-powered deviation identification
- ✅ **Persistent Data Storage**: Reliable DynamoDB-based data persistence
- ✅ **Instant Alerts**: SNS-powered email/SMS notifications
- ✅ **Web-based Configuration**: React.js frontend for threshold management
- ✅ **Real-time Monitoring**: Live data display and status tracking

### Advanced Features
- 🔄 **Auto-scaling**: Handles traffic spikes automatically
- 🔒 **Secure Authentication**: Certificate-based IoT device authentication
- 📊 **Status Visualization**: Color-coded status indicators
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful, intuitive user interface
- 📈 **Historical Data**: Access to recent sensor readings

## 🛠️ AWS Services Used

| Service | Purpose | Integration |
|---------|---------|-------------|
| **AWS Lambda** | Core compute engine | All business logic |
| **AWS IoT Core** | Device connectivity & messaging | MQTT broker, device management |
| **Amazon DynamoDB** | Data persistence | Sensor data & configuration storage |
| **Amazon SNS** | Notifications | Alert distribution |
| **Amazon API Gateway** | REST APIs | Frontend-backend communication |

| **Amazon CloudWatch** | Logging & monitoring | Centralized observability |

### Service Configuration Details

#### AWS Lambda Functions
- **Runtime**: Python 3.9
- **Architecture**: x86_64
- **Memory**: 128-256 MB (optimized for cost)
- **Timeout**: 10-30 seconds
- **Concurrency**: Auto-scaling

#### AWS IoT Core
- **Protocol**: MQTT over TLS
- **Authentication**: X.509 certificates
- **Topics**: `coldchain/sensors/data`
- **Rules**: Lambda function triggers

#### Amazon DynamoDB
- **Tables**: 2 (sensor data + configuration)
- **Capacity**: On-demand (auto-scaling)
- **Consistency**: Eventually consistent reads

## 📖 Setup Guide

For complete setup and deployment instructions, see [SETUP.md](./SETUP.md)

## 📚 API Documentation

### Configuration API
**Endpoint**: `POST /config`
**Purpose**: Update anomaly detection thresholds

**Request Body**:
```json
{
  "storageType": "Pharmaceuticals",
  "minTemp": 2.0,
  "maxTemp": 8.0,
  "maxHumidity": 65.0
}
```

**Response**:
```json
{
  "statusCode": 200,
  "body": {
    "message": "Configuration updated successfully",
    "config": {
      "storageType": "Pharmaceuticals",
      "minTemp": 2.0,
      "maxTemp": 8.0,
      "maxHumidity": 65.0
    }
  }
}
```

### Data Retrieval API
**Endpoint**: `GET /sensordata`
**Purpose**: Fetch latest sensor data

**Response**:
```json
{
  "statusCode": 200,
  "body": {
    "data": [
      {
        "deviceId": "cryosure_truck_001",
        "temperature": 4.2,
        "humidity": 67.3,
        "timestamp": 1703123456,
        "anomaly": false
      }
    ]
  }
}
```

## 🧪 Testing & Demo

### 1. Start IoT Simulator
```bash
cd Server
python simulate_cryosure_sensor.py
```

### 2. Configure Thresholds
1. Open the React frontend
2. Navigate to Configuration tab
3. Set temperature range (e.g., 2°C - 8°C)
4. Set humidity limit (e.g., 85%)
5. Save configuration

### 3. Monitor Real-time Data
1. Switch to Monitoring tab
2. Watch sensor data updates
3. Observe anomaly detection
4. Check email for SNS alerts

### 4. Test Anomaly Scenarios
The simulator randomly generates anomalies:
- **High Temperature**: 9°C - 15°C
- **Low Temperature**: -5°C - 1°C  
- **High Humidity**: 88% - 99%

## 🏗️ Architecture Diagram

![CryoSure Architecture](architecture-diagram.png)

*Note: Architecture diagram image will be added to the repository*

## 🏆 Judging Criteria Alignment

### Quality of the Idea (⭐⭐⭐⭐⭐)
- **Real-world Problem**: Addresses critical cold chain logistics challenges
- **Business Value**: Prevents spoilage, ensures compliance, reduces costs
- **Innovation**: Dynamic thresholding, real-time processing, serverless approach
- **Practical Impact**: Immediate deployment potential in logistics industry

### Architecture & Design (⭐⭐⭐⭐⭐)
- **Serverless Excellence**: 100% AWS managed services
- **Lambda Integration**: Core compute for all business logic
- **Event-Driven**: Real-time IoT processing
- **Scalability**: Auto-scaling from single to enterprise scale
- **Best Practices**: Separation of concerns, IAM security, cost optimization

### Completeness (⭐⭐⭐⭐⭐)
- **End-to-End Solution**: Device → Processing → Storage → Alerts → UI
- **Working Demo**: Fully functional with IoT simulator
- **Documentation**: Comprehensive setup and API documentation
- **Video Demonstration**: Complete walkthrough of functionality

## 🔮 Future Enhancements

### Phase 2 Features
- 📊 **Historical Analytics**: Amazon QuickSight integration
- 🔐 **User Authentication**: Amazon Cognito User Pools
- 📱 **Mobile App**: AWS Amplify native application
- 🤖 **ML Anomaly Detection**: Amazon SageMaker integration
- 🌐 **Multi-Device Management**: Fleet monitoring dashboard

### Advanced Integrations
- **Amazon Bedrock**: AI-powered anomaly prediction
- **Amazon Kinesis**: High-volume data streaming
- **Amazon ElastiCache**: Real-time caching layer
- **AWS Step Functions**: Complex workflow orchestration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: vishal27shetty@gmail.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/cryosure/issues)

---

**Built with ❤️ for the AWS Lambda Hackathon**

*CryoSure - Ensuring the integrity of your cold chain, one sensor at a time.* 