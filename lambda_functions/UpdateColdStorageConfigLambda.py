import json
import os
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
CONFIG_TABLE_NAME = os.environ.get('CONFIG_TABLE_NAME')

if not CONFIG_TABLE_NAME:
    raise EnvironmentError("CONFIG_TABLE_NAME environment variable is not set.")

config_table = dynamodb.Table(CONFIG_TABLE_NAME)

# This is the FIXED Partition Key value for the ONE item that stores the current active thresholds.
ACTIVE_CONFIG_PK_VALUE = "CURRENT_ACTIVE_THRESHOLDS"

def lambda_handler(event, context):
    print(f"Received event: {json.dumps(event)}")

    try:
        # The data is already parsed and available directly in the event
        # No need to parse event.body
        body = event

        # Frontend sends these 4 values:
        profile_name_from_frontend = body.get('storageType') # e.g., "Vaccine", "Produce", "Custom"
        min_temp = body.get('minTemp')
        max_temp = body.get('maxTemp')
        max_humidity = body.get('maxHumidity')

        print(f"Parsed values:")
        print(f"  storageType: {profile_name_from_frontend}")
        print(f"  minTemp: {min_temp}")
        print(f"  maxTemp: {max_temp}")
        print(f"  maxHumidity: {max_humidity}")

        # Basic validation
        if not profile_name_from_frontend or min_temp is None or max_temp is None or max_humidity is None:
            return {
                'statusCode': 400,
                'headers': { 'Content-Type': 'application/json' },
                'body': json.dumps({
                    'message': 'Missing one of the required fields: storageType, minTemp, maxTemp, maxHumidity',
                    'debug': {
                        'storageType': profile_name_from_frontend,
                        'minTemp': min_temp,
                        'maxTemp': max_temp,
                        'maxHumidity': max_humidity
                    }
                })
            }

        # Prepare item to store in DynamoDB
        item = {
            'storageType': ACTIVE_CONFIG_PK_VALUE, # This is the FIXED PK value for the active config item
            'activeProfileName': profile_name_from_frontend, # This stores the 'storageType' value from frontend
            'minTemp': Decimal(str(min_temp)),
            'maxTemp': Decimal(str(max_temp)),
            'maxHumidity': Decimal(str(max_humidity))
        }

        # Store/Update the single active configuration item
        config_table.put_item(Item=item)
        print(f"Active thresholds updated for profile '{profile_name_from_frontend}'.")

        return {
            'statusCode': 200,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps({'message': f'Active thresholds set to: {profile_name_from_frontend}'})
        }

    except Exception as e:
        print(f"ERROR: {e}")
        return {
            'statusCode': 500,
            'headers': { 'Content-Type': 'application/json' },
            'body': json.dumps({'message': f'Internal server error: {str(e)}'})
        }