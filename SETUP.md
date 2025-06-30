# CryoSure Setup Guide

Complete step-by-step instructions to deploy CryoSure on AWS.

## 📋 Prerequisites

### Required Accounts & Tools
- [ ] AWS Account with appropriate permissions
- [ ] Python 3.9+ installed
- [ ] Node.js 16+ installed
- [ ] Git installed
- [ ] AWS CLI configured (optional but recommended)

### AWS Permissions Required
- IAM Full Access (for creating roles)
- IoT Core Full Access
- Lambda Full Access
- DynamoDB Full Access
- SNS Full Access
- API Gateway Full Access
- S3 Full Access
- CloudWatch Logs Full Access

## 🚀 Step-by-Step Deployment

### Step 1: Clone and Prepare Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/cryosure.git
cd cryosure

# Verify structure
ls -la
# Should show: client/, Server/, README.md, SETUP.md
```

### Step 2: AWS IoT Core Setup

#### 2.1 Create IoT Thing
1. Go to AWS IoT Core Console
2. Navigate to **Manage** → **Things**
3. Click **Create things**
4. Choose **Create single thing**
5. **Thing name**: `cryosure_truck_001`
6. **Thing type**: Create new type `CryoSureSensor`
7. Click **Next**

#### 2.2 Generate Certificates
1. In **Security** section, choose **Create certificate**
2. Select **Auto-generate a new certificate**
3. Click **Activate**
4. Download all three files:
   - `cryosure_truck_001.pem.crt` (Device certificate)
   - `cryosure_truck_001.pem.key` (Private key)
   - `AmazonRootCA1.pem` (Root CA)
5. Click **Done**

#### 2.3 Create IoT Policy
1. Go to **Secure** → **Policies**
2. Click **Create policy**
3. **Policy name**: `cryosure_iot_policy`
4. **Policy document**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iot:Connect"
      ],
      "Resource": [
        "arn:aws:iot:us-east-1:*:client/cryosure_truck_001"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Publish"
      ],
      "Resource": [
        "arn:aws:iot:us-east-1:*:topic/coldchain/sensors/data"
      ]
    }
  ]
}
```
5. Click **Create**

#### 2.4 Attach Policy to Certificate
1. Go to **Secure** → **Certificates**
2. Select your certificate
3. Click **Actions** → **Attach policy**
4. Select `cryosure_iot_policy`
5. Click **Attach**

#### 2.5 Note IoT Endpoint
1. Go to **Settings**
2. Copy the **Custom endpoint** (e.g., `a1b2c3d4e5f6g7-ats.iot.us-east-1.amazonaws.com`)

### Step 3: DynamoDB Tables Setup

#### 3.1 Create Sensor Data Table
1. Go to DynamoDB Console
2. Click **Create table**
3. **Table name**: `ColdChainSensorData`
4. **Partition key**: `deviceId` (String)
5. **Sort key**: `timestamp` (Number)
6. **Table settings**: **Customize settings**
7. **Capacity mode**: **On-demand**
8. Click **Create**

#### 3.2 Create Configuration Table
1. Click **Create table**
2. **Table name**: `CryosureColdStorageConfig`
3. **Partition key**: `storageType` (String)
4. **Table settings**: **Customize settings**
5. **Capacity mode**: **On-demand**
6. Click **Create**

#### 3.3 Add Initial Configuration
1. Go to `CryosureColdStorageConfig` table
2. Click **Create item**
3. Switch to **JSON** view
4. Paste this configuration:
```json
{
  "storageType": "CURRENT_ACTIVE_THRESHOLDS",
  "activeProfileName": "Initial Default",
  "minTemp": 2.0,
  "maxTemp": 8.0,
  "maxHumidity": 85.0,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```
5. Click **Create item**

### Step 4: SNS Topic Setup

#### 4.1 Create SNS Topic
1. Go to SNS Console
2. Click **Create topic**
3. **Topic type**: **Standard**
4. **Name**: `CryosureAnomalyAlerts`
5. **Display name**: `CryoSure Anomaly Alerts`
6. Click **Create topic**

#### 4.2 Subscribe Email
1. Click on your topic
2. Click **Create subscription**
3. **Protocol**: **Email**
4. **Endpoint**: Your email address
5. Click **Create subscription**
6. Check your email and **Confirm subscription**

### Step 5: Lambda Functions Deployment

#### 5.1 Create Anomaly Detector Lambda

1. Go to Lambda Console
2. Click **Create function**
3. **Function name**: `CryosureAnomalyDetector`
4. **Runtime**: **Python 3.9**
5. **Architecture**: **x86_64**
6. Click **Create function**

7. **Configure function**:
   - **Memory**: 256 MB
   - **Timeout**: 30 seconds

8. **Environment variables**:
```
TABLE_NAME = ColdChainSensorData
CONFIG_TABLE_NAME = CryosureColdStorageConfig
SNS_TOPIC_ARN = arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:CryosureAnomalyAlerts
```

9. **IAM Role**: Create new role with these policies:
   - `AmazonDynamoDBFullAccess`
   - `AmazonSNSFullAccess`

10. **Function code**: Replace with content from `lambda_functions/cryosure_anomaly_detector.py`

#### 5.2 Create Config Update Lambda

1. Click **Create function**
2. **Function name**: `UpdateColdStorageConfigLambda`
3. **Runtime**: **Python 3.9**
4. **Architecture**: **x86_64**
5. Click **Create function**

6. **Configure function**:
   - **Memory**: 128 MB
   - **Timeout**: 10 seconds

7. **Environment variables**:
```
CONFIG_TABLE_NAME = CryosureColdStorageConfig
```

8. **IAM Role**: Create new role with:
   - `AmazonDynamoDBFullAccess`

9. **Function code**: Replace with content from `lambda_functions/update_cold_storage_config.py`

#### 5.3 Create Data Retrieval Lambda

1. Click **Create function**
2. **Function name**: `GetSensorDataLambda`
3. **Runtime**: **Python 3.9**
4. **Architecture**: **x86_64**
5. Click **Create function**

6. **Configure function**:
   - **Memory**: 128 MB
   - **Timeout**: 10 seconds

7. **Environment variables**:
```
SENSOR_TABLE_NAME = ColdChainSensorData
```

8. **IAM Role**: Create new role with:
   - `AmazonDynamoDBReadOnlyAccess`

9. **Function code**: Replace with content from `lambda_functions/get_sensor_data.py`

### Step 6: API Gateway Setup

#### 6.1 Create Configuration API

1. Go to API Gateway Console
2. Click **Create API**
3. **API type**: **REST API**
4. **API name**: `CryoSureConfigAPI`
5. **Description**: `API for CryoSure configuration management`
6. Click **Create API**

7. **Create resource**:
   - Click **Actions** → **Create Resource**
   - **Resource Name**: `config`
   - **Resource Path**: `/config`
   - Click **Create Resource**

8. **Create method**:
   - Click **Actions** → **Create Method**
   - **HTTP method**: **POST**
   - **Integration type**: **Lambda Function**
   - **Lambda Function**: `UpdateColdStorageConfigLambda`
   - **Use Lambda Proxy integration**: ✅ Checked
   - Click **Save**

9. **Enable CORS**:
   - Select `/config` resource
   - Click **Actions** → **Enable CORS**
   - **Access-Control-Allow-Origin**: `*`
   - Click **Enable CORS and replace existing CORS headers**

10. **Deploy API**:
    - Click **Actions** → **Deploy API**
    - **Deployment stage**: **New Stage**
    - **Stage name**: `prod`
    - Click **Deploy**

11. **Note the Invoke URL** (e.g., `https://abc123.execute-api.us-east-1.amazonaws.com/prod`)

#### 6.2 Create Data API

1. Click **Create API**
2. **API type**: **REST API**
3. **API name**: `CryoSureDataAPI`
4. **Description**: `API for CryoSure sensor data retrieval`
5. Click **Create API**

6. **Create resource**:
   - Click **Actions** → **Create Resource**
   - **Resource Name**: `sensordata`
   - **Resource Path**: `/sensordata`
   - Click **Create Resource**

7. **Create method**:
   - Click **Actions** → **Create Method**
   - **HTTP method**: **GET**
   - **Integration type**: **Lambda Function**
   - **Lambda Function**: `GetSensorDataLambda`
   - **Use Lambda Proxy integration**: ✅ Checked
   - Click **Save**

8. **Enable CORS**:
   - Select `/sensordata` resource
   - Click **Actions** → **Enable CORS**
   - **Access-Control-Allow-Origin**: `*`
   - Click **Enable CORS and replace existing CORS headers**

9. **Deploy API**:
    - Click **Actions** → **Deploy API**
    - **Deployment stage**: **New Stage**
    - **Stage name**: `prod`
    - Click **Deploy**

10. **Note the Invoke URL**

### Step 7: IoT Rule Creation

1. Go to AWS IoT Core Console
2. Navigate to **Message routing** → **Rules**
3. Click **Create rule**
4. **Rule name**: `ColdChainDataToLambda`
5. **Rule description**: `Route sensor data to Lambda for anomaly detection`

6. **Rule query statement**:
```sql
SELECT * FROM 'coldchain/sensors/data'
```

7. **Add action**:
   - Click **Add action**
   - **Action type**: **Send a message to a Lambda function**
   - **Function**: Select `CryosureAnomalyDetector`
   - Click **Add action**

8. Click **Create rule**

### Step 8: Frontend Deployment

#### 8.1 Build React Application

```bash
cd client

# Install dependencies
npm install

# Create environment file
cat > .env.production << EOF
VITE_API_GATEWAY_URL=https://YOUR_CONFIG_API_URL/prod/config
VITE_API_ENDPOINT=https://YOUR_DATA_API_URL/prod/sensordata
EOF

# Build application
npm run build
```

#### 8.2 Create S3 Bucket

1. Go to S3 Console
2. Click **Create bucket**
3. **Bucket name**: `cryosure-frontend-YOUR_UNIQUE_ID` (globally unique)
4. **Region**: Same as your Lambda functions
5. **Block Public Access**: Uncheck all options
6. Click **Create bucket**

#### 8.3 Configure Static Website Hosting

1. Select your bucket
2. Go to **Properties** tab
3. Scroll to **Static website hosting**
4. Click **Edit**
5. **Static website hosting**: **Enable**
6. **Index document**: `index.html`
7. **Error document**: `index.html`
8. Click **Save changes**

#### 8.4 Set Bucket Policy

1. Go to **Permissions** tab
2. Click **Bucket policy**
3. Click **Edit**
4. Paste this policy (replace `YOUR_BUCKET_NAME`):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```
5. Click **Save changes**

#### 8.5 Upload Frontend Files

```bash
# Upload all files from dist/ to S3
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete

# Or use the S3 Console to upload dist/ folder contents
```

### Step 9: Configure IoT Simulator

#### 9.1 Setup Certificate Files

```bash
cd Server

# Create secret directory
mkdir secret

# Copy your downloaded certificates to secret/
# cryosure_truck_001.pem.crt
# cryosure_truck_001.pem.key
# AmazonRootCA1.pem
```

#### 9.2 Create Environment File

```bash
# Create .env file
cat > .env << EOF
IOT_ENDPOINT=YOUR_IOT_ENDPOINT
THING_NAME=cryosure_truck_001
ROOT_CA_PATH=./secret/AmazonRootCA1.pem
PRIVATE_KEY_PATH=./secret/cryosure_truck_001.pem.key
CERTIFICATE_PATH=./secret/cryosure_truck_001.pem.crt
MQTT_TOPIC=coldchain/sensors/data
PUBLISH_INTERVAL_SECONDS=5
TEMP_NORMAL_MIN=2.0
TEMP_NORMAL_MAX=8.0
HUMIDITY_NORMAL_MAX=85.0
TEMP_ANOMALY_RANGE_LOW_MIN=-5.0
TEMP_ANOMALY_RANGE_LOW_MAX=1.0
TEMP_ANOMALY_RANGE_HIGH_MIN=9.0
TEMP_ANOMALY_RANGE_HIGH_MAX=15.0
HUMIDITY_ANOMALY_RANGE_HIGH_MIN=88.0
HUMIDITY_ANOMALY_RANGE_HIGH_MAX=99.0
ANOMALY_PROBABILITY=0.15
EOF
```

#### 9.3 Install Python Dependencies

```bash
# Install required packages
pip install -r requirements.txt
```

### Step 10: Test the Application

#### 10.1 Start IoT Simulator

```bash
cd Server
python simulate_cryosure_sensor.py
```

Expected output:
```
Connecting to AWS IoT Core endpoint: a1b2c3d4e5f6g7-ats.iot.us-east-1.amazonaws.com...
Successfully connected to AWS IoT Core.
Simulating NORMAL conditions for cryosure_truck_001...
Published message to topic 'coldchain/sensors/data': {"deviceId": "cryosure_truck_001", "temperature": 4.2, "humidity": 67.3, "timestamp": 1703123456}
```

#### 10.2 Access Frontend

1. Go to your S3 bucket's static website URL
2. Navigate to Configuration tab
3. Set your desired thresholds
4. Switch to Monitoring tab
5. Watch real-time data updates

#### 10.3 Verify Data Flow

1. **DynamoDB**: Check `ColdChainSensorData` table for new entries
2. **SNS**: Check your email for anomaly alerts
3. **CloudWatch**: View Lambda function logs
4. **Frontend**: Verify data updates in real-time

## 🔧 Troubleshooting

### Common Issues

#### IoT Connection Failed
- Verify certificate files are in correct location
- Check IoT endpoint URL
- Ensure IoT policy is attached to certificate

#### Lambda Function Errors
- Check CloudWatch logs for error details
- Verify environment variables are set correctly
- Ensure IAM roles have proper permissions

#### API Gateway CORS Issues
- Verify CORS is enabled on both APIs
- Check that `Access-Control-Allow-Origin` is set to `*`

#### Frontend Not Loading
- Verify S3 bucket policy allows public read access
- Check that all files from `dist/` are uploaded
- Ensure environment variables are set correctly

#### No Data in DynamoDB
- Check IoT simulator is running
- Verify IoT rule is created and active
- Check Lambda function logs for errors

### Debug Commands

```bash
# Test IoT connection
aws iot describe-endpoint

# Check Lambda function status
aws lambda get-function --function-name CryosureAnomalyDetector

# View DynamoDB table
aws dynamodb scan --table-name ColdChainSensorData

# Check SNS topic
aws sns list-topics
```

## 📊 Monitoring & Maintenance

### CloudWatch Dashboards
Create a dashboard to monitor:
- Lambda function invocations and errors
- DynamoDB read/write capacity
- IoT Core message count
- API Gateway request count

### Cost Optimization
- Monitor Lambda function duration and memory usage
- Review DynamoDB on-demand capacity
- Check SNS message delivery rates

### Security Best Practices
- Rotate IoT certificates regularly
- Use least-privilege IAM policies
- Enable CloudTrail for API monitoring
- Implement proper error handling

## 🎉 Success Criteria

Your CryoSure deployment is successful when:

✅ IoT simulator connects and publishes data  
✅ Lambda functions process data without errors  
✅ DynamoDB tables receive new entries  
✅ SNS sends email alerts for anomalies  
✅ Frontend displays real-time data  
✅ Configuration updates work from UI  
✅ All components scale automatically  

## 📞 Support

If you encounter issues:

1. Check CloudWatch logs for error details
2. Verify all environment variables are set
3. Ensure all AWS services are in the same region
4. Review IAM permissions for each service
5. Test each component individually

For additional help, create an issue in the GitHub repository or contact the development team.

---

**Happy Deploying! 🚀**

*CryoSure - Your cold chain monitoring solution is now ready to protect your valuable cargo.* 