import json
import os
import boto3
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

TABLE_NAME = os.environ.get('TABLE_NAME')  # For sensor data
CONFIG_TABLE_NAME = os.environ.get('CONFIG_TABLE_NAME')  # For threshold config
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN')

if not all([TABLE_NAME, CONFIG_TABLE_NAME, SNS_TOPIC_ARN]):
    raise EnvironmentError("Missing one or more environment variables (TABLE_NAME, CONFIG_TABLE_NAME, SNS_TOPIC_ARN).")

sensor_data_table = dynamodb.Table(TABLE_NAME)
config_table = dynamodb.Table(CONFIG_TABLE_NAME)

ACTIVE_CONFIG_PK_VALUE = "CURRENT_ACTIVE_THRESHOLDS"

DEFAULT_MIN_TEMP = Decimal('2.0')
DEFAULT_MAX_TEMP = Decimal('8.0')
DEFAULT_MAX_HUMIDITY = Decimal('85.0')
DEFAULT_PROFILE_NAME = "Default (No Config Set)"


def get_current_active_thresholds():
    try:
        response = config_table.get_item(Key={'storageType': ACTIVE_CONFIG_PK_VALUE})
        active_config_item = response.get('Item')

        if active_config_item:
            print(f"Fetched active config: {active_config_item}")
            return {
                'profileName': active_config_item.get('activeProfileName', DEFAULT_PROFILE_NAME),
                'minTemp': active_config_item.get('minTemp', DEFAULT_MIN_TEMP),
                'maxTemp': active_config_item.get('maxTemp', DEFAULT_MAX_TEMP),
                'maxHumidity': active_config_item.get('maxHumidity', DEFAULT_MAX_HUMIDITY)
            }
        else:
            print(f"No active config item found ('{ACTIVE_CONFIG_PK_VALUE}'). Using internal defaults.")
            return {
                'profileName': DEFAULT_PROFILE_NAME,
                'minTemp': DEFAULT_MIN_TEMP,
                'maxTemp': DEFAULT_MAX_TEMP,
                'maxHumidity': DEFAULT_MAX_HUMIDITY
            }

    except Exception as e:
        print(f"ERROR fetching active config: {e}. Using internal defaults.")
        return {
            'profileName': DEFAULT_PROFILE_NAME,
            'minTemp': DEFAULT_MIN_TEMP,
            'maxTemp': DEFAULT_MAX_TEMP,
            'maxHumidity': DEFAULT_MAX_HUMIDITY
        }


def lambda_handler(event, context):
    print(f"Received IoT event: {json.dumps(event)}")

    try:
        device_id = event.get('deviceId')
        temperature = event.get('temperature')
        humidity = event.get('humidity')
        timestamp = event.get('timestamp')

        if not all([device_id, temperature is not None, humidity is not None, timestamp is not None]):
            print(f"ERROR: Missing essential fields in IoT payload. Skipping: {event}")
            return {'statusCode': 400, 'body': 'Missing data.'}

        temperature = Decimal(str(temperature))
        humidity = Decimal(str(humidity))
        timestamp = Decimal(str(timestamp))

        active_thresholds = get_current_active_thresholds()
        current_profile_name = active_thresholds['profileName']
        TEMP_MIN_CELSIUS = active_thresholds['minTemp']
        TEMP_MAX_CELSIUS = active_thresholds['maxTemp']
        HUMIDITY_MAX_PERCENT = active_thresholds['maxHumidity']

        print(f"Applying thresholds for '{current_profile_name}': Temp {TEMP_MIN_CELSIUS}-{TEMP_MAX_CELSIUS}°C, Humidity < {HUMIDITY_MAX_PERCENT}%")

        is_anomaly = False
        anomaly_details = []

        if not (TEMP_MIN_CELSIUS <= temperature <= TEMP_MAX_CELSIUS):
            is_anomaly = True
            anomaly_details.append(f"Temperature {temperature}°C is outside range ({TEMP_MIN_CELSIUS}-{TEMP_MAX_CELSIUS}°C).")

        if humidity > HUMIDITY_MAX_PERCENT:
            is_anomaly = True
            anomaly_details.append(f"Humidity {humidity}% is above limit ({HUMIDITY_MAX_PERCENT}%).")

        item_to_store = {
            'deviceId': device_id,
            'timestamp': timestamp,
            'temperature': temperature,
            'humidity': humidity,
            'appliedProfileName': current_profile_name,
            'isAnomaly': is_anomaly,
            'anomalyDetails': anomaly_details if anomaly_details else ["No anomaly"]
        }

        sensor_data_table.put_item(Item=item_to_store)
        print(f"Data stored for {device_id}. Anomaly: {is_anomaly}")

        if is_anomaly:
            formatted_timestamp = datetime.fromtimestamp(float(timestamp)).strftime('%Y-%m-%d %H:%M:%S UTC')
            subject = f"CryoSure ANOMALY: Device {device_id} ({current_profile_name})"
            message = (
                f"Anomaly detected for Device: {device_id}\n"
                f"Profile: {current_profile_name}\n"
                f"Timestamp: {formatted_timestamp}\n"
                f"Temp: {temperature}°C (Range: {TEMP_MIN_CELSIUS}-{TEMP_MAX_CELSIUS}°C)\n"
                f"Humidity: {humidity}% (Max: {HUMIDITY_MAX_PERCENT}%)\n"
                f"Details: {', '.join(anomaly_details)}"
            )
            sns.publish(TopicArn=SNS_TOPIC_ARN, Message=message, Subject=subject)
            print(f"SNS alert sent for {device_id}.")

    except Exception as e:
        print(f"CRITICAL ERROR in Anomaly Detector: {e}. Event: {json.dumps(event)}")
        return {'statusCode': 500, 'body': f'Error: {str(e)}'}

    return {'statusCode': 200, 'body': 'Processing complete.'}
