import json

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        query = body.get('query', '')

        print(f"Received Query: {query}")

        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "Received query successfully.",
                "query": query
            }),
            "headers": {
                "Content-Type": "application/json"
            }
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
