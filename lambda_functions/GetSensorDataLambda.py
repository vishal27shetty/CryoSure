import json
import os
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')

SENSOR_TABLE_NAME = os.environ.get('SENSOR_TABLE_NAME')

if not SENSOR_TABLE_NAME:
    raise EnvironmentError("SENSOR_TABLE_NAME environment variable is not set.")

sensor_table = dynamodb.Table(SENSOR_TABLE_NAME)

# Helper to convert Decimal to float for JSON serialization
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

def lambda_handler(event, context):
    print(f"Received event: {json.dumps(event)}")

    try:
        # Get the latest 'limit' number of items
        response = sensor_table.scan(
            Limit=20  # Get up to 20 items for display
        )
        items = response.get('Items', [])

        # Sort items by timestamp in descending order
        sorted_items = sorted(
            items,
            key=lambda x: Decimal(str(x.get('timestamp', '0'))),
            reverse=True
        )

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',  # VERY IMPORTANT for frontend CORS
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({'data': sorted_items}, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"Error fetching sensor data: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',  # VERY IMPORTANT for frontend CORS
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps({'message': f'Internal server error: {str(e)}'})
        }
