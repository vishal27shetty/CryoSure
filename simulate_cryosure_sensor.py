import time
import json
import random
import os
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Load configuration from environment variables
IOT_ENDPOINT = os.getenv("IOT_ENDPOINT")
THING_NAME = os.getenv("THING_NAME")
ROOT_CA_PATH = os.getenv("ROOT_CA_PATH")
PRIVATE_KEY_PATH = os.getenv("PRIVATE_KEY_PATH")
CERTIFICATE_PATH = os.getenv("CERTIFICATE_PATH")
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "coldchain/sensors/data")
PUBLISH_INTERVAL_SECONDS = int(os.getenv("PUBLISH_INTERVAL_SECONDS", "5"))

TEMP_NORMAL_MIN = float(os.getenv("TEMP_NORMAL_MIN", "2.0"))
TEMP_NORMAL_MAX = float(os.getenv("TEMP_NORMAL_MAX", "8.0"))
HUMIDITY_NORMAL_MAX = float(os.getenv("HUMIDITY_NORMAL_MAX", "85.0"))
TEMP_ANOMALY_RANGE_LOW = (
    float(os.getenv("TEMP_ANOMALY_RANGE_LOW_MIN", "-5.0")),
    float(os.getenv("TEMP_ANOMALY_RANGE_LOW_MAX", "1.0"))
)
TEMP_ANOMALY_RANGE_HIGH = (
    float(os.getenv("TEMP_ANOMALY_RANGE_HIGH_MIN", "9.0")),
    float(os.getenv("TEMP_ANOMALY_RANGE_HIGH_MAX", "15.0"))
)
HUMIDITY_ANOMALY_RANGE_HIGH = (
    float(os.getenv("HUMIDITY_ANOMALY_RANGE_HIGH_MIN", "88.0")),
    float(os.getenv("HUMIDITY_ANOMALY_RANGE_HIGH_MAX", "99.0"))
)
ANOMALY_PROBABILITY = float(os.getenv("ANOMALY_PROBABILITY", "0.15"))

required_vars = ["IOT_ENDPOINT", "THING_NAME", "ROOT_CA_PATH", "PRIVATE_KEY_PATH", "CERTIFICATE_PATH"]
missing_vars = [var for var in required_vars if not os.getenv(var)]
if missing_vars:
    print(f"ERROR: Missing required environment variables: {', '.join(missing_vars)}")
    exit(1)

cert_files = [ROOT_CA_PATH, PRIVATE_KEY_PATH, CERTIFICATE_PATH]
missing_files = [file for file in cert_files if file and not os.path.exists(file)]
if missing_files:
    print(f"ERROR: Missing certificate files: {', '.join(missing_files)}")
    exit(1)

try:
    myMQTTClient = AWSIoTMQTTClient(THING_NAME)
    myMQTTClient.configureEndpoint(IOT_ENDPOINT, 8883)
    myMQTTClient.configureCredentials(str(ROOT_CA_PATH), str(PRIVATE_KEY_PATH), str(CERTIFICATE_PATH))
    myMQTTClient.configureOfflinePublishQueueing(-1)
    myMQTTClient.configureDrainingFrequency(2)
    myMQTTClient.configureConnectDisconnectTimeout(10)
    myMQTTClient.configureMQTTOperationTimeout(5)
    print(f"Connecting to AWS IoT Core endpoint: {IOT_ENDPOINT}...")
    myMQTTClient.connect()
    print("Successfully connected to AWS IoT Core.")
except Exception as e:
    print(f"ERROR: Could not connect to AWS IoT Core. Details: {e}")
    exit(1)

try:
    while True:
        timestamp = int(datetime.utcnow().timestamp())
        is_anomaly = random.random() < ANOMALY_PROBABILITY
        temperature = None
        humidity = None
        if is_anomaly:
            anomaly_type = random.choice(['temp_high', 'temp_low', 'humidity_high'])
            if anomaly_type == 'temp_high':
                temperature = round(random.uniform(TEMP_ANOMALY_RANGE_HIGH[0], TEMP_ANOMALY_RANGE_HIGH[1]), 2)
                humidity = round(random.uniform(30, HUMIDITY_NORMAL_MAX), 2)
                print(f"Simulating HIGH TEMPERATURE ANOMALY for {THING_NAME}...")
            elif anomaly_type == 'temp_low':
                temperature = round(random.uniform(TEMP_ANOMALY_RANGE_LOW[0], TEMP_ANOMALY_RANGE_LOW[1]), 2)
                humidity = round(random.uniform(30, HUMIDITY_NORMAL_MAX), 2)
                print(f"Simulating LOW TEMPERATURE ANOMALY for {THING_NAME}...")
            else:
                temperature = round(random.uniform(TEMP_NORMAL_MIN, TEMP_NORMAL_MAX), 2)
                humidity = round(random.uniform(HUMIDITY_ANOMALY_RANGE_HIGH[0], HUMIDITY_ANOMALY_RANGE_HIGH[1]), 2)
                print(f"Simulating HIGH HUMIDITY ANOMALY for {THING_NAME}...")
        else:
            temperature = round(random.uniform(TEMP_NORMAL_MIN, TEMP_NORMAL_MAX), 2)
            humidity = round(random.uniform(30, HUMIDITY_NORMAL_MAX), 2)
            print(f"Simulating NORMAL conditions for {THING_NAME}...")
        payload = {
            "deviceId": THING_NAME,
            "temperature": temperature,
            "humidity": humidity,
            "timestamp": timestamp
        }
        message_json = json.dumps(payload)
        try:
            myMQTTClient.publish(MQTT_TOPIC, message_json, 1)
            print(f"Published message to topic '{MQTT_TOPIC}': {message_json}")
        except Exception as e:
            print(f"ERROR: Failed to publish message: {e}")
        time.sleep(PUBLISH_INTERVAL_SECONDS)
except KeyboardInterrupt:
    print("Simulation stopped by user (Ctrl+C detected).")
except Exception as e:
    print(f"An unexpected error occurred during simulation: {e}")
finally:
    try:
        if 'myMQTTClient' in locals():
            myMQTTClient.disconnect()
            print("Disconnected from AWS IoT Core.")
    except Exception as e:
        print(f"Error during disconnect: {e}")

